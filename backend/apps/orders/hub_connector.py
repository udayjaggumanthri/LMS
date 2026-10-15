"""LMS server calls the hub with the credential stored for its registered application."""

import json
import logging

from django.conf import settings

from apps.payment_hub.authentication import signed_body, verify_result_signature
from apps.payment_hub.bootstrap import sync_from_gateway_settings
from apps.payment_hub.models import HubTransaction, PaymentApplication
from apps.payment_hub.services import HubError, cancel_payment, create_payment, inquire_status, public_payment

logger = logging.getLogger(__name__)


def _application():
    sync_from_gateway_settings()
    application_id = getattr(settings, 'LMS_HUB_APPLICATION_ID', 'LMS')
    return (
        PaymentApplication.objects.filter(application_id=application_id)
        .select_related('provider_profile')
        .first()
    )


def _credential(application):
    return application.credentials.filter(active=True).first() if application else None


def _present(application, payload, idempotency_key=None):
    """Sign the body the same way an HTTP client would, then call the hub service."""
    cred = _credential(application)
    if cred is None:
        raise HubError('This application has no credential.', 403)
    raw, timestamp, signature = signed_body(cred.hmac_secret, payload)
    if not verify_result_signature(application, timestamp, signature, raw):
        raise HubError('Application credential was rejected.', 401)
    data = json.loads(raw.decode('utf-8'))
    return create_payment(
        application,
        data,
        idempotency_key=idempotency_key,
        extra_invoice_taken=_legacy_invoice_taken,
    )


def _legacy_invoice_taken(invoice):
    from apps.orders.models import PaymentTransaction
    return PaymentTransaction.objects.filter(invoice_number=invoice).exists()


def initiate_through_hub(order, customer_name, customer_phone, customer_email, public_base=''):
    from apps.orders.models import PaymentTransaction

    sync_from_gateway_settings(public_base)
    application = _application()
    if application is None:
        return {'success': False, 'error': 'Payment application is not registered.'}
    payload = {
        'application_order_id': str(order.id),
        'amount': str(order.total),
        'currency': 'INR',
        'name': customer_name,
        'phone': customer_phone,
        'email': customer_email,
    }
    try:
        txn = _present(application, payload, idempotency_key=f'order-{order.id}')
    except HubError as exc:
        logger.info('Hub refused LMS checkout for order %s', order.order_number)
        return {'success': False, 'error': exc.message}

    PaymentTransaction.objects.update_or_create(
        invoice_number=txn.toucan_invoice,
        defaults={
            'order': order,
            'amount': order.total,
            'currency': 'INR',
            'status': 'pending',
            'gateway_provider': 'toucanpay',
            'terminal_id': application.provider_profile.tid if application.provider_profile else '',
            'session_redirect_url': txn.redirect_url,
            'hub_transaction': txn,
        },
    )
    presented = public_payment(txn)
    return {
        'success': True,
        'redirect_url': presented['redirect_url'],
        'invoice_number': presented['invoice'],
        'is_simulated': False,
    }


def refresh_lms_payment(invoice_number):
    from apps.orders.fulfillment import apply_hub_result
    from apps.payment_hub.services import _result_body

    txn = HubTransaction.objects.filter(toucan_invoice=invoice_number).select_related(
        'payment_application', 'payment_application__provider_profile'
    ).first()
    if txn is None:
        return {'success': False, 'error': 'Transaction not found'}
    txn, message = inquire_status(txn)
    txn.refresh_from_db()
    if txn.payment_status == HubTransaction.PaymentStatus.SUCCESS:
        apply_hub_result(_result_body(txn))
        return {
            'success': True,
            'status': 'SUCCESS',
            'invoice_number': txn.toucan_invoice,
            'message': message,
            'action_code': (txn.provider_metadata or {}).get('actionCode') or '',
        }
    return {
        'success': False,
        'status': txn.payment_status,
        'message': message,
        'error': message,
        'action_code': (txn.provider_metadata or {}).get('actionCode') or '',
    }


def cancel_lms_payment(invoice_number):
    txn = HubTransaction.objects.filter(toucan_invoice=invoice_number).select_related('payment_application').first()
    if txn is None:
        return None
    return cancel_payment(txn.payment_application, txn.internal_id)


def verify_incoming_result(request):
    raw = request.body or b''
    try:
        payload = json.loads(raw.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return None
    application_id = payload.get('application_id')
    expected = getattr(settings, 'LMS_HUB_APPLICATION_ID', 'LMS')
    if application_id != expected:
        return None
    application = PaymentApplication.objects.filter(application_id=application_id).first()
    if application is None:
        return None
    timestamp = request.META.get('HTTP_X_HUB_TIMESTAMP', '')
    signature = request.META.get('HTTP_X_HUB_SIGNATURE', '')
    if not verify_result_signature(application, timestamp, signature, raw):
        return None
    return payload
