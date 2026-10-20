import hashlib
import time
import datetime
import random
import json
import logging
import urllib.request
import urllib.parse
from decimal import Decimal
from django.conf import settings
from apps.admin_governance.models import PaymentGatewaySettings
from .models import Order, PaymentTransaction

logger = logging.getLogger(__name__)

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """
    Prevents urllib from automatically following HTTP 302 redirects so we can
    capture the 'Location' header pointing to the official ToucanPay checkout page.
    """
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def return_url(base, **params):
    """Append order id and invoice onto an LMS return address."""
    parts = urllib.parse.urlsplit(base)
    query = dict(urllib.parse.parse_qsl(parts.query, keep_blank_values=True))
    for key, value in params.items():
        if value is not None and value != '':
            query[key] = str(value)
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path, urllib.parse.urlencode(query), ''))


def failure_message_from_location(url):
    """ToucanPay puts a failure page in Location when the terminal or request is rejected."""
    if not url or '/auth/failure/' not in url:
        return None
    token = url.split('/auth/failure/', 1)[1].split('?', 1)[0].strip()
    pad = '=' * (-len(token) % 4)
    text = ''
    try:
        import base64
        text = base64.b64decode(token + pad).decode('utf-8', 'replace').strip()
    except Exception:
        text = ''
    if 'terminal' in text.lower():
        return (
            'ToucanPay could not open checkout: this terminal is not registered on the gateway address saved in Payment Gateway. '
            'Nothing was charged.'
        )
    if text:
        return f'ToucanPay could not open checkout: {text} Nothing was charged.'
    return 'ToucanPay could not open checkout. Nothing was charged.'


class ToucanPayService:
    @staticmethod
    def get_settings():
        return PaymentGatewaySettings.get_settings()

    @staticmethod
    def compute_hash_amount(amount):
        """
        Computes SHA-512 hex digest of the transaction amount string according to ToucanPay specification.
        Example: ta='23' -> 6ff334e1051a09e90127ba4e309e026bb830163a2ce3a355af2ce2310ff6e7e9830d20196a3472bfc8632fd3b60cb56102a84fae70ab1a32942055eb40022225
        """
        try:
            dec = Decimal(str(amount))
            if dec == dec.to_integral():
                amt_str = str(int(dec))
            else:
                amt_str = f"{dec:.2f}"
        except Exception:
            amt_str = str(amount)

        return hashlib.sha512(amt_str.encode('utf-8')).hexdigest()

    generate_hash_amount = compute_hash_amount

    @classmethod
    def generate_invoice_number(cls, tid=None):
        """
        Order id from the checkout spec sample: ddMMyyyyHHmmss plus extra digits.
        Minimum 15 digits, unique, and not prefixed with the terminal.
        ToucanPay builds pspRefNo itself as terminal number + this invoice.
        """
        now = datetime.datetime.now()
        timestamp_str = now.strftime('%d%m%Y%H%M%S')
        extra = f"{now.microsecond:06d}{random.randint(0, 99):02d}"
        invoice = f"{timestamp_str}{extra}"
        if PaymentTransaction.objects.filter(invoice_number=invoice).exists():
            invoice = f"{timestamp_str}{random.randint(10000000, 99999999)}"
        return invoice

    @staticmethod
    def resolve_return_urls(pg_settings, public_base=''):
        """Saved admin addresses win. A blank address follows the site the shopper is on."""
        base = (public_base or '').rstrip('/')
        success = (pg_settings.success_url or '').strip()
        failure = (pg_settings.failure_url or '').strip()
        if not success and base:
            success = f'{base}/order-confirmation'
        if not failure and base:
            failure = f'{base}/checkout?status=failed'
        return success, failure

    @classmethod
    def initiate_payment(cls, order, customer_name, customer_phone, customer_email, public_base=''):
        from django.conf import settings as dj_settings
        if getattr(dj_settings, 'PAYMENT_HUB_ENABLED', True):
            from .hub_connector import initiate_through_hub
            return initiate_through_hub(
                order, customer_name, customer_phone, customer_email, public_base=public_base
            )
        return cls._initiate_payment_legacy(order, customer_name, customer_phone, customer_email, public_base)

    @classmethod
    def _initiate_payment_legacy(cls, order, customer_name, customer_phone, customer_email, public_base=''):
        """
        Initiates a payment session with ToucanPay Checkout API.
        Returns the authentic redirect URL where the customer completes payment.
        """
        pg_settings = cls.get_settings()
        if not pg_settings.is_configured:
            logger.error("ToucanPay credentials (mid, tid, mac_token) are not configured.")
            return {
                'success': False,
                'error': 'Payment Gateway is not configured. Platform Administrator must enter valid ToucanPay credentials in Admin Console.'
            }
        invoice_number = cls.generate_invoice_number(pg_settings.tid)
        
        # Format transaction amount
        dec_amount = Decimal(str(order.total))
        if dec_amount == dec_amount.to_integral():
            ta_str = str(int(dec_amount))
        else:
            ta_str = f"{dec_amount:.2f}"

        ha = cls.compute_hash_amount(ta_str)

        # Clean phone: ensure 10 digits
        clean_phone = ''.join(filter(str.isdigit, customer_phone or ''))
        if len(clean_phone) > 10:
            clean_phone = clean_phone[-10:]
        if len(clean_phone) != 10:
            return {'success': False, 'error': 'Enter a 10-digit mobile number.'}

        clean_name = (customer_name or '').strip() or (order.user.get_full_name() or '').strip() or order.user.username
        clean_email = (customer_email or order.user.email or '').strip()
        if not clean_email or '@' not in clean_email:
            return {'success': False, 'error': 'A valid email is required for payment.'}

        success_base, failure_base = cls.resolve_return_urls(pg_settings, public_base)
        if not success_base or not failure_base:
            return {
                'success': False,
                'error': 'Set the success and failure addresses in Admin → Payment Gateway before taking a payment.',
            }

        endpoint = (pg_settings.checkout_session_url or '').strip()
        murl = (pg_settings.merchant_region_url or '').strip()
        if not endpoint or not murl:
            return {
                'success': False,
                'error': 'Set the checkout address and merchant region URL in Admin → Payment Gateway before taking a payment.',
            }

        # Create PaymentTransaction record
        transaction = PaymentTransaction.objects.create(
            order=order,
            invoice_number=invoice_number,
            amount=order.total,
            currency='INR',
            status='initiated',
            gateway_provider='toucanpay',
            terminal_id=pg_settings.tid
        )

        # Checkout, region, and return addresses are exactly what the admin saved.
        # A completed payment is posted to surl, and a declined one to furl.
        # Both come from the addresses saved in the admin payment settings.
        return_params = {'orderId': order.id, 'invoice': invoice_number}
        surl = return_url(success_base, **return_params)
        furl = return_url(failure_base, status='cancelled', **return_params)
        payload = {
            't': pg_settings.tid,
            'o': invoice_number,
            'ta': ta_str,
            'c': 'INR',
            'mac': pg_settings.mac_token,
            'murl': murl,
            'surl': surl,
            'furl': furl,
            'name': clean_name,
            'phone': clean_phone,
            'emailId': clean_email,
            'ha': ha,
        }

        logger.info(f"Initiating ToucanPay session for Order {order.order_number}, Invoice {invoice_number}")

        # Send POST request to ToucanPay getpaymentsession using NoRedirectHandler
        opener = urllib.request.build_opener(NoRedirectHandler)
        post_data = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(
            endpoint,
            data=post_data,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Prajnadhara-LMS/1.0'
            }
        )

        redirect_url = None
        raw_headers = {}
        status_code = None

        try:
            resp = opener.open(req, timeout=12)
            status_code = resp.status
            raw_headers = dict(resp.headers)
            redirect_url = raw_headers.get('Location') or raw_headers.get('location')
            if not redirect_url:
                body_bytes = resp.read()
                if body_bytes:
                    try:
                        body_json = json.loads(body_bytes.decode('utf-8'))
                        redirect_url = body_json.get('Location') or body_json.get('location') or body_json.get('redirectUrl')
                    except Exception:
                        pass
            transaction.raw_response = {
                'status_code': status_code,
                'headers': raw_headers
            }
            transaction.save()

        except urllib.error.HTTPError as e:
            # ToucanPay returns HTTP 302 redirect with Location in headers
            status_code = e.code
            raw_headers = dict(e.headers)
            redirect_url = raw_headers.get('Location') or raw_headers.get('location')
            if not redirect_url:
                body_bytes = e.read()
                if body_bytes:
                    try:
                        body_json = json.loads(body_bytes.decode('utf-8'))
                        redirect_url = body_json.get('Location') or body_json.get('location') or body_json.get('redirectUrl')
                    except Exception:
                        pass
            transaction.raw_response = {'http_error': e.code, 'headers': raw_headers}
            transaction.save()

        except Exception as ex:
            logger.error(f"ToucanPay connection error: {ex}")
            transaction.raw_response = {'connection_exception': str(ex)}
            transaction.status = 'failed'
            transaction.save()
            host = endpoint.split('/')[2] if '://' in endpoint else endpoint
            server_ip = (pg_settings.whitelisted_ip or '').strip()
            where = f' from {server_ip}' if server_ip else ''
            return {
                'success': False,
                'error': (
                    f'Could not reach the saved checkout address at {host}{where}. '
                    'Nothing was charged.'
                ),
            }

        # A failure Location is ToucanPay rejecting the session. Do not send the browser there.
        if redirect_url:
            rejected = failure_message_from_location(redirect_url)
            if rejected:
                transaction.session_redirect_url = redirect_url
                transaction.status = 'failed'
                transaction.raw_response = {**(transaction.raw_response or {}), 'failure': rejected}
                transaction.save(update_fields=['session_redirect_url', 'status', 'raw_response'])
                logger.warning('ToucanPay refused the checkout session for invoice %s', invoice_number)
                return {'success': False, 'error': rejected}

            transaction.session_redirect_url = redirect_url
            transaction.status = 'pending'
            transaction.save()
            return {
                'success': True,
                'redirect_url': redirect_url,
                'invoice_number': invoice_number,
                'is_simulated': False
            }

        return {
            'success': False,
            'error': 'Payment session initiation failed. Verify ToucanPay configuration.'
        }

    @classmethod
    def check_payment_status(cls, invoice_number):
        from django.conf import settings as dj_settings
        if getattr(dj_settings, 'PAYMENT_HUB_ENABLED', True):
            from .hub_connector import refresh_lms_payment
            return refresh_lms_payment(invoice_number)
        return cls._check_payment_status_legacy(invoice_number)

    @classmethod
    def _check_payment_status_legacy(cls, invoice_number):
        """
        Executes Status Check API against ToucanPay to verify transaction success.
        """
        pg_settings = cls.get_settings()
        transaction = PaymentTransaction.objects.filter(invoice_number=invoice_number).first()
        if not transaction:
            return {'success': False, 'error': 'Transaction not found'}

        endpoint = (pg_settings.status_check_url or '').strip()
        if not endpoint:
            return {'success': False, 'error': 'Set the status check address in Admin → Payment Gateway.'}

        req_body = {
            "messageID": "/api/pay/v1/checkStatus",
            "requestType": "text",
            "object": {
                "invoiceNumber": invoice_number,
                "terminalNumber": pg_settings.tid,
                "merchantNumber": pg_settings.mid
            }
        }

        post_data = json.dumps(req_body).encode('utf-8')
        req = urllib.request.Request(
            endpoint,
            data=post_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {pg_settings.mac_token}",
                'User-Agent': 'Prajnadhara-LMS/1.0'
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=7) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                transaction.raw_response['check_status'] = res_data
                
                # Check actionCode
                action_code = res_data.get('object', {}).get('actionCode')
                if action_code == '00':
                    return cls.mark_transaction_successful(transaction, res_data.get('object', {}))
                else:
                    transaction.status = 'failed'
                    transaction.save()
                    return {'success': False, 'status': 'FAILED', 'data': res_data}

        except Exception as ex:
            logger.warning(f"ToucanPay status check notice: {ex}")
            # If simulated session completed or verified locally
            if transaction.status == 'success':
                return {'success': True, 'status': 'SUCCESS', 'data': {'invoiceNumber': invoice_number}}
            return {'success': False, 'error': str(ex)}

    @classmethod
    def mark_transaction_successful(cls, transaction, gateway_metadata=None):
        """Backward-compatible wrapper. Enrollment lives in orders.fulfillment."""
        from .fulfillment import mark_lms_order_paid
        order = mark_lms_order_paid(transaction.order, transaction, gateway_metadata)
        return {
            'success': True,
            'status': 'SUCCESS',
            'order_id': order.id,
            'order_number': order.order_number,
            'invoice_number': transaction.invoice_number,
        }

    @classmethod
    def process_callback(cls, payload, remote_addr='', forwarded_for=''):
        from django.conf import settings as dj_settings
        if getattr(dj_settings, 'PAYMENT_HUB_ENABLED', True):
            from apps.payment_hub.services import process_callback
            return process_callback(payload, remote_addr=remote_addr, forwarded_for=forwarded_for)
        return cls._process_callback_legacy(payload)

    @classmethod
    def _process_callback_legacy(cls, payload):
        """
        Handles ToucanPay Server-to-Server Callback POST.
        """
        logger.info(f"Processing ToucanPay callback: {payload}")
        psp_ref = payload.get('pspRefNo', '')
        status = payload.get('status', '').upper()
        resp_code = payload.get('payeeRespCode', '')

        # Locate transaction by invoice number extracted from pspRefNo or custRefNo
        transaction = None
        pg_settings = cls.get_settings()
        tid = pg_settings.tid

        if psp_ref and psp_ref.startswith(tid):
            inv = psp_ref[len(tid):]
            transaction = PaymentTransaction.objects.filter(invoice_number=inv).first()

        if not transaction and psp_ref:
            transaction = PaymentTransaction.objects.filter(invoice_number=psp_ref).first()

        if not transaction and payload.get('custRefNo'):
            transaction = PaymentTransaction.objects.filter(invoice_number=payload['custRefNo']).first()

        if transaction and (status == 'SUCCESS' or resp_code == '00'):
            cls.mark_transaction_successful(transaction, {
                'actionCode': resp_code or '00',
                'approvalCode': payload.get('approvalNumber', ''),
                'rrn': payload.get('upiTransRefNo', ''),
                'custVpa': payload.get('payerVPA', '')
            })
            transaction.raw_response['callback'] = payload
            transaction.save()

        # Respond according to ToucanPay specification
        return {"suceess": True}
