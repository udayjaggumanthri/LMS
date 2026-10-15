"""Toucan posts the browser back to the success page and drops the order reference."""

import logging

from django.conf import settings

from apps.payment_hub.models import HubTransaction
from apps.payment_hub.providers.toucan import candidate_invoices, return_url

logger = logging.getLogger(__name__)


def browser_return_location(data):
    data = data or {}
    logger.info('Toucan browser return fields: %s', sorted(str(key) for key in data))
    try:
        txn = _txn_from_fields(data)
    except Exception:
        logger.exception('Toucan browser return could not find the payment')
        return '/order-confirmation?unmatched=1'
    if txn is None:
        return '/order-confirmation?unmatched=1'
    try:
        _settle(txn)
        txn.refresh_from_db()
    except Exception:
        logger.exception('Toucan browser return could not settle invoice %s', txn.toucan_invoice)
    return _location_for(txn)


def _location_for(txn):
    application = txn.payment_application
    paid = txn.payment_status == HubTransaction.PaymentStatus.SUCCESS
    base = ((application.success_url if paid else application.failure_url) or '').strip() or '/order-confirmation'
    params = {'orderId': txn.application_order_id, 'invoice': txn.toucan_invoice}
    if not paid:
        params['status'] = 'cancelled'
    return return_url(base, **params)


def _txn_from_fields(data):
    invoices = []
    for key in ('invoice', 'o', 'invoiceNumber', 'invoice_number', 'custRefNo', 'orderNo'):
        value = str(data.get(key) or '').strip()
        if value:
            invoices.append(value)
    invoices.extend(candidate_invoices(data))
    seen = []
    for item in invoices:
        if item and item not in seen:
            seen.append(item)
    if seen:
        txn = (
            HubTransaction.objects.filter(toucan_invoice__in=seen)
            .select_related('payment_application')
            .order_by('-id')
            .first()
        )
        if txn is not None:
            return txn
    order_id = str(data.get('orderId') or data.get('order_id') or '').strip()
    if not order_id:
        return None
    matches = list(
        HubTransaction.objects.filter(application_order_id=order_id)
        .select_related('payment_application')
        .order_by('-id')[:2]
    )
    if len(matches) == 1:
        return matches[0]
    return None


def _settle(txn):
    from apps.payment_hub.services import inquire_status

    lms_id = getattr(settings, 'LMS_HUB_APPLICATION_ID', 'LMS')
    if txn.payment_application.application_id == lms_id:
        from apps.orders.hub_connector import refresh_lms_payment
        refresh_lms_payment(txn.toucan_invoice)
        return
    inquire_status(txn)
