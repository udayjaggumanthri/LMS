"""LMS enrollment and receipt. The payment hub does not import this module."""

import logging

from django.db.models import F

from apps.core.email_service import EmailService
from apps.learning.models import Enrollment

logger = logging.getLogger(__name__)


def mark_lms_order_paid(order, transaction=None, gateway_metadata=None):
    from apps.orders.tax_invoice import assign_tax_invoice_number

    if order.status == 'completed' and transaction is not None and transaction.status == 'success':
        assign_tax_invoice_number(order)
        return order
    metadata = gateway_metadata or {}
    if transaction is not None:
        transaction.status = 'success'
        transaction.action_code = metadata.get('actionCode', '00') or '00'
        transaction.approval_code = metadata.get('approvalCode', '') or ''
        transaction.rrn = metadata.get('rrn', '') or ''
        transaction.payer_vpa = metadata.get('custVpa', '') or ''
        transaction.save()

    order.status = 'completed'
    order.payment_method = 'ToucanPay Official Gateway'
    if transaction is not None:
        order.payment_id = transaction.invoice_number
    order.save()

    for item in order.items.all():
        _, created = Enrollment.objects.get_or_create(
            user=order.user,
            course=item.course,
            defaults={'is_active': True},
        )
        if created:
            type(item.course).objects.filter(pk=item.course_id).update(student_count=F('student_count') + 1)

    if order.coupon_code:
        from apps.cart.models import Coupon
        coupon = Coupon.objects.filter(code=order.coupon_code).first()
        if coupon:
            type(coupon).objects.filter(pk=coupon.pk).update(used_count=F('used_count') + 1)

    try:
        EmailService.send_purchase_receipt(order.user, order)
    except Exception as exc:
        logger.warning('Failed to send email receipt for Order %s: %s', order.order_number, exc)
    assign_tax_invoice_number(order)
    return order


def apply_hub_result(payload):
    from apps.orders.models import Order, PaymentTransaction

    order = Order.objects.filter(pk=payload.get('application_order_id')).first()
    if order is None:
        return False
    transaction = PaymentTransaction.objects.filter(invoice_number=payload.get('invoice') or '').first()
    status = payload.get('payment_status')
    metadata = payload.get('provider_metadata') or {}
    if status == 'SUCCESS':
        mark_lms_order_paid(order, transaction, metadata)
        return True
    if status in ('FAILED', 'CANCELLED') and transaction is not None and transaction.status != 'success':
        record_lms_payment_failure(
            order,
            transaction,
            'Cancelled' if status == 'CANCELLED' else 'Failed',
        )
    return True


def record_lms_payment_failure(order, transaction=None, status_label='Failed'):
    """Mark one unpaid attempt as failed and tell the student once."""
    from django.db import transaction as db_transaction
    from apps.orders.models import Order, PaymentTransaction

    if order is None:
        return
    with db_transaction.atomic():
        order = Order.objects.select_for_update().filter(pk=order.pk).first()
        if order is None or order.status == 'completed':
            return
        tx = None
        if transaction is not None:
            tx = PaymentTransaction.objects.select_for_update().filter(pk=transaction.pk).first()
            if tx is not None and tx.status == 'success':
                return
        already_sent = (
            (tx is not None and tx.status == 'failed')
            or order.status in ('failed', 'cancelled')
        )
        if tx is not None and tx.status != 'failed':
            tx.status = 'failed'
            tx.save(update_fields=['status'])
        if order.status not in ('failed', 'cancelled'):
            order.status = 'cancelled' if status_label == 'Cancelled' else 'failed'
            order.save(update_fields=['status'])
    if already_sent:
        return
    try:
        EmailService.send_payment_failed(order.user, order, status_label)
    except Exception as exc:
        logger.warning('Failed to send payment notice for Order %s: %s', order.order_number, exc)
