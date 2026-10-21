"""Create, status, cancel, callback, and signed delivery. One path for every application."""

import json
import logging
import urllib.parse
import urllib.request
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.payment_hub.models import (
    ApplicationDelivery,
    CallbackEvent,
    HubTransaction,
    amount_decimal,
    fingerprint_payload,
    json_canonical,
    sign_body,
)
from apps.payment_hub.providers import toucan

logger = logging.getLogger(__name__)

CONTRACT_VERSION = '1'
POLL_LIMIT = 3
FINAL_PAYMENT = {
    HubTransaction.PaymentStatus.SUCCESS,
    HubTransaction.PaymentStatus.FAILED,
    HubTransaction.PaymentStatus.CANCELLED,
}


class HubError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


def create_payment(application, data, idempotency_key=None, extra_invoice_taken=None):
    if not application.enabled:
        raise HubError('This application is disabled.', 403)
    profile = application.provider_profile
    if profile is None or not profile.approved or not profile.is_configured:
        raise HubError('No approved payment provider is configured for this application.', 409)

    payload = dict(data or {})
    payload.pop('application_id', None)
    payload.pop('success_url', None)
    payload.pop('failure_url', None)
    payload.pop('result_endpoint', None)
    order_id = str(payload.get('application_order_id') or '').strip()
    if not order_id:
        raise HubError('application_order_id is required.')
    if payload.get('currency') not in (None, '', 'INR'):
        raise HubError('This provider profile accepts INR only.')
    try:
        amount = amount_decimal(payload.get('amount'))
    except Exception as exc:
        raise HubError('amount is required.') from exc
    if amount <= 0:
        raise HubError('amount must be greater than zero.')

    if idempotency_key:
        existing = HubTransaction.objects.filter(payment_application=application, idempotency_key=idempotency_key).first()
        ready = _ready_payment(existing)
        if ready is not None:
            return ready
        if existing is not None:
            raise HubError('A payment is already opening for this order.', 409)

    name = str(payload.get('name') or '').strip()
    if not name:
        raise HubError('Customer name is required for payment.')
    email = str(payload.get('email') or '').strip()
    if '@' not in email:
        raise HubError('A valid email is required for payment.')
    if email.lower().endswith('@contact.placeholder'):
        raise HubError('A real customer email is required for payment.')
    customer = {
        'name': name,
        'phone': payload.get('phone') or '',
        'email': email,
        'application_order_id': order_id,
    }
    phone = toucan.clean_phone(customer['phone'])
    if len(phone) != 10:
        raise HubError('Enter a 10-digit mobile number.')

    txn = None
    for _attempt in range(5):
        invoice = toucan.generate_invoice_number(extra_taken=extra_invoice_taken)
        try:
            txn = HubTransaction.objects.create(
                payment_application=application,
                application_id=application.application_id,
                environment=application.environment or profile.environment,
                application_order_id=order_id,
                toucan_invoice=invoice,
                amount=amount,
                currency='INR',
                payment_status=HubTransaction.PaymentStatus.INITIATED,
                customer_name=name,
                customer_phone=phone,
                customer_email=email,
                idempotency_key=idempotency_key or None,
            )
            break
        except IntegrityError as exc:
            existing = _existing_after_collision(application, order_id, idempotency_key, exc)
            ready = _ready_payment(existing)
            if ready is not None:
                return ready
            if existing is not None:
                raise HubError('A payment is already opening for this order.', 409) from exc
            if _is_invoice_collision(exc):
                continue
            raise HubError('A payment already exists for this order.', 409) from exc
    if txn is None:
        raise HubError('Could not open a unique payment session. Try again.', 503)

    result = toucan.start_checkout(profile, application, invoice, amount, customer)
    txn.raw_provider = _safe_raw(result.get('raw'))
    if not result.get('success'):
        txn.payment_status = HubTransaction.PaymentStatus.FAILED
        txn.redirect_url = result.get('redirect_url') or ''
        txn.save(update_fields=['payment_status', 'redirect_url', 'raw_provider', 'updated_at'])
        raise HubError(result.get('error') or 'Payment session initiation failed.', 502)
    txn.payment_status = HubTransaction.PaymentStatus.PENDING
    txn.redirect_url = result.get('redirect_url') or ''
    txn.save(update_fields=['payment_status', 'redirect_url', 'raw_provider', 'updated_at'])
    return txn


def _constraint_text(exc):
    return str(getattr(exc, '__cause__', None) or exc).lower()


def _is_invoice_collision(exc):
    text = _constraint_text(exc)
    return 'toucan_invoice' in text or 'invoice' in text


def _ready_payment(txn):
    if txn is None:
        return None
    if txn.redirect_url or txn.payment_status != HubTransaction.PaymentStatus.INITIATED:
        return txn
    return None


def _existing_after_collision(application, order_id, idempotency_key, exc):
    text = _constraint_text(exc)
    if idempotency_key and 'idempotency' in text:
        return HubTransaction.objects.filter(
            payment_application=application, idempotency_key=idempotency_key
        ).first()
    if 'application_order' in text or 'uniq_hub_application_order' in text:
        return HubTransaction.objects.filter(
            payment_application=application, application_order_id=order_id
        ).first()
    return None


def get_transaction(application, internal_id):
    txn = HubTransaction.objects.filter(payment_application=application, internal_id=internal_id).first()
    if txn is None:
        raise HubError('Payment not found.', 404)
    return txn


def refresh_status(txn):
    if txn.payment_status in FINAL_PAYMENT or txn.payment_status == HubTransaction.PaymentStatus.UNKNOWN:
        return txn
    if txn.poll_count >= POLL_LIMIT:
        txn.payment_status = HubTransaction.PaymentStatus.UNKNOWN
        txn.save(update_fields=['payment_status', 'updated_at'])
        return txn
    txn.poll_count += 1
    txn.save(update_fields=['poll_count', 'updated_at'])
    txn, _message = inquire_status(txn)
    if txn.payment_status not in FINAL_PAYMENT and txn.poll_count >= POLL_LIMIT:
        txn.payment_status = HubTransaction.PaymentStatus.UNKNOWN
        txn.save(update_fields=['payment_status', 'updated_at'])
    return txn


def inquire_status(txn):
    """Ask Toucan checkStatus once. A click always calls the gateway, even after earlier polls."""
    profile = txn.payment_application.provider_profile
    if profile is None:
        raise HubError('No payment provider is configured for this application.', 409)
    previous = txn.payment_status
    result = toucan.check_status(profile, txn.toucan_invoice)
    txn.raw_provider = {**(txn.raw_provider or {}), 'check_status': _safe_raw(result.get('raw') or result)}
    if result.get('error') and not result.get('action_code'):
        txn.save(update_fields=['raw_provider', 'updated_at'])
        return txn, result.get('error') or 'Toucan status check did not respond.'
    metadata = result.get('metadata') or {}
    txn.provider_metadata = metadata
    txn.provider_reference = str(metadata.get('rrn') or txn.provider_reference or '')
    action_code = str(result.get('action_code') or '')
    if result.get('success'):
        txn.payment_status = HubTransaction.PaymentStatus.SUCCESS
        message = 'Toucan confirmed this payment.'
    elif action_code:
        if previous != HubTransaction.PaymentStatus.SUCCESS:
            txn.payment_status = HubTransaction.PaymentStatus.FAILED
        message = f'Toucan reported response code {action_code}.'
    else:
        message = 'Toucan did not return a payment result.'
    txn.save(update_fields=['payment_status', 'provider_metadata', 'provider_reference', 'raw_provider', 'updated_at'])
    terminal = txn.payment_status in (
        HubTransaction.PaymentStatus.SUCCESS,
        HubTransaction.PaymentStatus.FAILED,
    )
    changed = txn.payment_status != previous
    if terminal and (changed or txn.delivery_status != HubTransaction.DeliveryStatus.DELIVERED):
        if changed and txn.delivery_status == HubTransaction.DeliveryStatus.DELIVERED:
            txn.delivery_status = HubTransaction.DeliveryStatus.PENDING
            txn.delivery_attempt_count = 0
            txn.save(update_fields=['delivery_status', 'delivery_attempt_count', 'updated_at'])
        deliver(txn)
        txn.refresh_from_db()
    return txn, message


def cancel_payment(application, internal_id):
    txn = get_transaction(application, internal_id)
    if txn.payment_status == HubTransaction.PaymentStatus.SUCCESS:
        return txn
    if txn.payment_status not in FINAL_PAYMENT:
        txn.payment_status = HubTransaction.PaymentStatus.CANCELLED
        txn.save(update_fields=['payment_status', 'updated_at'])
    return txn


def client_ips(remote_addr='', forwarded_for=''):
    ips = []
    if forwarded_for:
        ips.extend(part.strip() for part in forwarded_for.split(',') if part.strip())
    if remote_addr:
        ips.append(remote_addr.strip())
    return ips


def process_callback(payload, remote_addr='', forwarded_for=''):
    data = payload if isinstance(payload, dict) else {}
    digest = fingerprint_payload(data)
    if CallbackEvent.objects.filter(fingerprint=digest).exists():
        return {'suceess': True}

    txn = _find_transaction(data)
    ips = client_ips(remote_addr, forwarded_for)
    if txn is not None and not _ip_allowed(txn, ips):
        CallbackEvent.objects.create(
            transaction=txn,
            fingerprint=digest,
            payload=data,
            remote_ip=ips[0] if ips else '',
            accepted=False,
        )
        logger.warning('Rejected Toucan callback from %s for invoice %s', ips, txn.toucan_invoice)
        return {'suceess': False}

    event = CallbackEvent.objects.create(
        transaction=txn,
        fingerprint=digest,
        payload=data,
        remote_ip=ips[0] if ips else '',
        accepted=txn is not None,
    )
    if txn is None:
        return {'suceess': True}

    status = str(data.get('status') or '').upper()
    resp_code = str(data.get('payeeRespCode') or '')
    with transaction.atomic():
        locked = HubTransaction.objects.select_for_update(of=('self',)).get(pk=txn.pk)
        already_final = locked.payment_status in (
            HubTransaction.PaymentStatus.SUCCESS,
            HubTransaction.PaymentStatus.FAILED,
        )
        if not already_final:
            locked.raw_provider = {**(locked.raw_provider or {}), 'callback': data}
            locked.provider_reference = str(data.get('pspRefNo') or data.get('upiTransRefNo') or locked.provider_reference or '')
            locked.provider_metadata = {
                'actionCode': resp_code or '00',
                'approvalCode': data.get('approvalNumber') or '',
                'rrn': data.get('upiTransRefNo') or '',
                'custVpa': data.get('payerVPA') or '',
            }
            if status == 'SUCCESS' or resp_code == '00':
                locked.payment_status = HubTransaction.PaymentStatus.SUCCESS
            elif status:
                locked.payment_status = HubTransaction.PaymentStatus.FAILED
            locked.save(update_fields=['payment_status', 'provider_reference', 'provider_metadata', 'raw_provider', 'updated_at'])
            event.accepted = True
            event.save(update_fields=['accepted'])
        final_status = locked.payment_status
    if final_status in (HubTransaction.PaymentStatus.SUCCESS, HubTransaction.PaymentStatus.FAILED):
        deliver(locked)
    return {'suceess': True}


def deliver(txn):
    with transaction.atomic():
        locked = (
            HubTransaction.objects.select_for_update(of=('self',))
            .select_related('payment_application', 'payment_application__provider_profile')
            .get(pk=txn.pk)
        )
        if locked.delivery_status == HubTransaction.DeliveryStatus.DELIVERED:
            return locked
        if locked.payment_status not in (HubTransaction.PaymentStatus.SUCCESS, HubTransaction.PaymentStatus.FAILED):
            return locked
        app = locked.payment_application
        if not app.enabled or not app.absolute_result_endpoint():
            locked.delivery_status = HubTransaction.DeliveryStatus.FAILED
            locked.save(update_fields=['delivery_status', 'updated_at'])
            return locked
        if locked.delivery_attempt_count >= app.retry_max:
            locked.delivery_status = HubTransaction.DeliveryStatus.FAILED
            locked.save(update_fields=['delivery_status', 'updated_at'])
            return locked
        locked.delivery_attempt_count += 1
        attempt = locked.delivery_attempt_count
        locked.save(update_fields=['delivery_attempt_count', 'updated_at'])

    body = _result_body(locked)
    raw = json_canonical(body)
    secret = _active_secret(locked.payment_application)
    timestamp = str(int(timezone.now().timestamp()))
    signature = sign_body(secret, timestamp, raw) if secret else ''
    url = locked.payment_application.absolute_result_endpoint()
    try:
        code = post_signed(
            url,
            raw,
            {
                'Content-Type': 'application/json',
                'X-Hub-Timestamp': timestamp,
                'X-Hub-Signature': signature,
                'User-Agent': toucan.STATUS_USER_AGENT,
            },
            timeout=locked.payment_application.timeout_seconds or 10,
        )
        locked.delivery_status = HubTransaction.DeliveryStatus.DELIVERED
        locked.next_delivery_at = None
        error = ''
    except Exception as exc:
        logger.warning('Result delivery failed for invoice %s', locked.toucan_invoice)
        locked.delivery_status = HubTransaction.DeliveryStatus.RETRYING
        delay = min(300, 2 ** attempt)
        locked.next_delivery_at = timezone.now() + timedelta(seconds=delay)
        code = None
        error = str(exc)[:500]
    locked.save(update_fields=['delivery_status', 'next_delivery_at', 'updated_at'])
    ApplicationDelivery.objects.create(
        transaction=locked,
        attempt=attempt,
        status=locked.delivery_status,
        response_code=code,
        error=error,
    )
    if locked.delivery_attempt_count >= locked.payment_application.retry_max and locked.delivery_status != HubTransaction.DeliveryStatus.DELIVERED:
        locked.delivery_status = HubTransaction.DeliveryStatus.FAILED
        locked.save(update_fields=['delivery_status', 'updated_at'])
    return locked


def retry_due_deliveries():
    due = HubTransaction.objects.filter(
        delivery_status=HubTransaction.DeliveryStatus.RETRYING,
        next_delivery_at__lte=timezone.now(),
    ).select_related('payment_application')[:10]
    for txn in due:
        deliver(txn)


def public_payment(txn):
    return {
        'id': str(txn.internal_id),
        'application_order_id': txn.application_order_id,
        'invoice': txn.toucan_invoice,
        'amount': str(txn.amount),
        'currency': txn.currency,
        'payment_status': txn.payment_status,
        'delivery_status': txn.delivery_status,
        'redirect_url': txn.redirect_url,
        'provider_reference': txn.provider_reference,
        'name': txn.customer_name or '',
        'phone': txn.customer_phone or '',
        'email': txn.customer_email or '',
    }


def post_signed(url, body, headers, timeout=10):
    parsed = urllib.parse.urlsplit(url)
    if parsed.hostname == 'testserver':
        from django.test import Client
        path = parsed.path or '/'
        if parsed.query:
            path = f'{path}?{parsed.query}'
        extra = {}
        for key, value in headers.items():
            if key.lower() == 'content-type':
                continue
            extra['HTTP_' + key.upper().replace('-', '_')] = value
        response = Client().post(path, data=body, content_type='application/json', **extra)
        if response.status_code >= 400:
            raise RuntimeError(f'delivery status {response.status_code}')
        return response.status_code

    request = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status >= 400:
            raise RuntimeError(f'delivery status {response.status}')
        return response.status


def _result_body(txn):
    return {
        'version': CONTRACT_VERSION,
        'application_id': txn.application_id,
        'application_order_id': txn.application_order_id,
        'payment_status': txn.payment_status,
        'amount': str(txn.amount),
        'currency': txn.currency,
        'invoice': txn.toucan_invoice,
        'provider_reference': txn.provider_reference,
        'internal_id': str(txn.internal_id),
        'provider_metadata': txn.provider_metadata or {},
        'name': txn.customer_name or '',
        'phone': txn.customer_phone or '',
        'email': txn.customer_email or '',
    }


def _active_secret(application):
    cred = application.credentials.filter(active=True).first()
    if cred is None:
        return ''
    return cred.hmac_secret


def _find_transaction(payload):
    invoices = toucan.candidate_invoices(payload if isinstance(payload, dict) else {})
    if not invoices:
        return None
    return (
        HubTransaction.objects.filter(toucan_invoice__in=invoices)
        .select_related('payment_application', 'payment_application__provider_profile')
        .first()
    )


def _ip_allowed(txn, ips):
    profile = txn.payment_application.provider_profile
    allow = profile.callback_ips() if profile is not None else []
    if not allow:
        return True
    return any(ip in allow for ip in ips)


def _safe_raw(value):
    if value is None:
        return {}
    try:
        json.dumps(value, default=str)
        return value
    except TypeError:
        return {'note': 'unserializable'}
