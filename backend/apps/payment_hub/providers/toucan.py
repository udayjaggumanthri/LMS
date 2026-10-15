"""Toucan checkout, status, and callback parsing. No application-specific branches."""

import datetime
import hashlib
import json
import logging
import secrets
import urllib.error
import urllib.parse
import urllib.request
from decimal import Decimal

logger = logging.getLogger(__name__)

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Prajnadhara-LMS/1.0'
STATUS_USER_AGENT = 'Prajnadhara-LMS/1.0'


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def format_amount(amount):
    dec = Decimal(str(amount))
    if dec == dec.to_integral():
        return str(int(dec))
    return f'{dec:.2f}'


def compute_hash_amount(amount):
    """SHA-512 hex of the amount string Toucan expects in `ha`."""
    try:
        amt_str = format_amount(amount)
    except Exception:
        amt_str = str(amount)
    return hashlib.sha512(amt_str.encode('utf-8')).hexdigest()


def return_url(base, **params):
    parts = urllib.parse.urlsplit(base)
    query = dict(urllib.parse.parse_qsl(parts.query, keep_blank_values=True))
    for key, value in params.items():
        if value is not None and value != '':
            query[key] = str(value)
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path, urllib.parse.urlencode(query), ''))


def failure_message_from_location(url):
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


def generate_invoice_number(extra_taken=None):
    """Minimum 15 digits. Toucan builds pspRefNo as terminal id plus this invoice."""
    from apps.payment_hub.models import HubTransaction

    def taken(invoice):
        if HubTransaction.objects.filter(toucan_invoice=invoice).exists():
            return True
        return bool(extra_taken and extra_taken(invoice))

    now = datetime.datetime.now()
    timestamp_str = now.strftime('%d%m%Y%H%M%S')
    for _ in range(5):
        invoice = f'{timestamp_str}{now.microsecond:06d}{secrets.randbelow(1000000):06d}'
        if not taken(invoice):
            return invoice
    return f'{timestamp_str}{secrets.randbelow(10**12):012d}'


def clean_phone(phone):
    digits = ''.join(ch for ch in (phone or '') if ch.isdigit())
    if len(digits) > 10:
        digits = digits[-10:]
    return digits


def candidate_invoices(payload):
    """Invoice candidates from pspRefNo / custRefNo. The caller matches a stored invoice."""
    psp_ref = str(payload.get('pspRefNo') or '')
    cust_ref = str(payload.get('custRefNo') or '')
    found = []
    if psp_ref:
        found.append(psp_ref)
        from apps.payment_hub.models import ProviderProfile
        tids = [tid for tid in ProviderProfile.objects.exclude(tid='').values_list('tid', flat=True) if tid]
        tids.sort(key=len, reverse=True)
        for tid in tids:
            if psp_ref.startswith(tid) and len(psp_ref) > len(tid):
                found.append(psp_ref[len(tid):])
    if cust_ref:
        found.append(cust_ref)
    return found


def _opener():
    return urllib.request.build_opener(NoRedirectHandler)


def start_checkout(profile, application, invoice, amount, customer):
    """POST the Toucan session form. Returns a result dict and does not write models."""
    ta_str = format_amount(amount)
    phone = clean_phone(customer.get('phone'))
    if len(phone) != 10:
        return {'success': False, 'error': 'Enter a 10-digit mobile number.'}
    email = (customer.get('email') or '').strip()
    if not email or '@' not in email:
        return {'success': False, 'error': 'A valid email is required for payment.'}
    name = (customer.get('name') or '').strip() or 'Customer'
    success_base = (application.success_url or '').strip()
    failure_base = (application.failure_url or '').strip()
    if not success_base or not failure_base:
        return {
            'success': False,
            'error': 'Set the success and failure addresses on the registered application before taking a payment.',
        }
    endpoint = (profile.checkout_session_url or '').strip()
    murl = (profile.merchant_region_url or '').strip()
    if not endpoint or not murl:
        return {
            'success': False,
            'error': 'Set the checkout address and merchant region URL on the provider profile before taking a payment.',
        }
    if not profile.tid or not profile.mac_token:
        return {'success': False, 'error': 'This application has no payment provider credentials.'}

    return_params = {'orderId': customer.get('application_order_id') or '', 'invoice': invoice}
    payload = {
        't': profile.tid,
        'o': invoice,
        'ta': ta_str,
        'c': 'INR',
        'mac': profile.mac_token,
        'murl': murl,
        'surl': return_url(success_base, **return_params),
        'furl': return_url(failure_base, status='cancelled', **return_params),
        'name': name,
        'phone': phone,
        'emaiId': email,
        'ha': compute_hash_amount(ta_str),
    }
    opener = _opener()
    post_data = urllib.parse.urlencode(payload).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=post_data,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
        },
    )
    redirect_url = None
    raw = {}
    try:
        resp = opener.open(req, timeout=12)
        raw = {'status_code': resp.status, 'headers': dict(resp.headers)}
        redirect_url = raw['headers'].get('Location') or raw['headers'].get('location')
        if not redirect_url:
            body_bytes = resp.read()
            redirect_url = _redirect_from_body(body_bytes)
    except urllib.error.HTTPError as exc:
        raw = {'http_error': exc.code, 'headers': dict(exc.headers)}
        redirect_url = raw['headers'].get('Location') or raw['headers'].get('location')
        if not redirect_url:
            redirect_url = _redirect_from_body(exc.read())
    except Exception as exc:
        logger.error('Toucan checkout connection failed for invoice %s', invoice)
        host = endpoint.split('/')[2] if '://' in endpoint else endpoint
        server_ip = (profile.whitelisted_ip or '').strip()
        where = f' from {server_ip}' if server_ip else ''
        return {
            'success': False,
            'error': f'Could not reach the saved checkout address at {host}{where}. Nothing was charged.',
            'raw': {'connection_exception': str(exc)},
        }

    if redirect_url:
        rejected = failure_message_from_location(redirect_url)
        if rejected:
            logger.warning('Toucan refused the checkout session for invoice %s', invoice)
            return {'success': False, 'error': rejected, 'redirect_url': redirect_url, 'raw': {**raw, 'failure': rejected}}
        return {'success': True, 'redirect_url': redirect_url, 'raw': raw, 'invoice': invoice}

    return {'success': False, 'error': 'Payment session initiation failed. Verify the provider profile.', 'raw': raw}


def _redirect_from_body(body_bytes):
    if not body_bytes:
        return None
    try:
        body_json = json.loads(body_bytes.decode('utf-8'))
    except Exception:
        return None
    return body_json.get('Location') or body_json.get('location') or body_json.get('redirectUrl')


def check_status(profile, invoice):
    endpoint = (profile.status_check_url or '').strip()
    if not endpoint:
        return {'success': False, 'error': 'Set the status check address on the provider profile.'}
    req_body = {
        'messageID': '/api/pay/v1/checkStatus',
        'requestType': 'text',
        'object': {
            'invoiceNumber': invoice,
            'terminalNumber': profile.tid,
            'merchantNumber': profile.mid,
        },
    }
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(req_body).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {profile.mac_token}',
            'User-Agent': STATUS_USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=7) as response:
            res_data = json.loads(response.read().decode('utf-8'))
    except Exception as exc:
        logger.warning('Toucan status check failed for invoice %s', invoice)
        return {'success': False, 'error': str(exc)}
    action_code = (res_data.get('object') or {}).get('actionCode')
    metadata = res_data.get('object') or {}
    return {
        'success': action_code == '00',
        'action_code': action_code,
        'metadata': metadata,
        'raw': res_data,
        'status': 'SUCCESS' if action_code == '00' else 'FAILED',
    }
