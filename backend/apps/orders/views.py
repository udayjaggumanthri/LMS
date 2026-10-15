import uuid
import time
from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import F
from django.utils import timezone
from apps.core.permissions import IsAdminUser
from apps.courses.models import Course
from apps.cart.models import CartItem, Coupon
from .models import Order, OrderItem
from .serializers import OrderSerializer

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({
            'error': 'Pay through ToucanPay from the checkout page. This endpoint does not complete an order.'
        }, status=status.HTTP_400_BAD_REQUEST)


class MyOrdersListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminOrdersViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = OrderSerializer

    def get_queryset(self):
        from django.db.models import Q

        rows = Order.objects.all().select_related('user').prefetch_related('items', 'transactions')
        q = (self.request.query_params.get('q') or '').strip()
        if not q:
            return rows
        return rows.filter(
            Q(order_number__icontains=q)
            | Q(invoice_number__icontains=q)
            | Q(payment_id__icontains=q)
            | Q(user__email__icontains=q)
            | Q(user__username__icontains=q)
            | Q(transactions__invoice_number__icontains=q)
        ).distinct()

    @action(detail=True, methods=['post'], url_path='status-check')
    def status_check(self, request, pk=None):
        from .models import PaymentTransaction
        from .toucanpay_service import ToucanPayService

        order = self.get_object()
        transaction = PaymentTransaction.objects.filter(order=order).order_by('-id').first()
        if transaction is None:
            return Response({'error': 'This order has no gateway payment to check.'}, status=status.HTTP_404_NOT_FOUND)
        result = ToucanPayService.check_payment_status(transaction.invoice_number)
        order.refresh_from_db()
        return Response({
            'success': bool(result.get('success')),
            'status': result.get('status') or order.status,
            'message': result.get('message') or result.get('error') or '',
            'actionCode': result.get('action_code') or '',
            'order': OrderSerializer(order).data,
        })

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        from apps.learning.models import Enrollment
        order = self.get_object()
        if order.status == 'refunded':
            return Response(OrderSerializer(order).data)
        if order.status != 'completed':
            return Response({'error': 'Only a completed order can be refunded.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'refunded'
        order.save(update_fields=['status'])
        for item in order.items.all():
            Enrollment.objects.filter(user=order.user, course=item.course).update(is_active=False)
        return Response(OrderSerializer(order).data)


class AdminPaymentSearchView(APIView):
    """Every stored payment, for any buyer. Search matches an order or a gateway invoice."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Q

        from apps.payment_hub.models import HubTransaction

        q = (request.query_params.get('q') or '').strip()
        orders = Order.objects.all().select_related('user').prefetch_related('items', 'transactions')
        if q:
            orders = orders.filter(
                Q(order_number__icontains=q)
                | Q(invoice_number__icontains=q)
                | Q(payment_id__icontains=q)
                | Q(user__email__icontains=q)
                | Q(user__username__icontains=q)
                | Q(transactions__invoice_number__icontains=q)
            ).distinct()
        order_rows = list(orders.order_by('-created_at')[:200])
        listed_invoices = set()
        for order in order_rows:
            for txn in order.transactions.all():
                if txn.invoice_number:
                    listed_invoices.add(txn.invoice_number)

        payments = []
        if q:
            hubs = (
                HubTransaction.objects.filter(
                    Q(toucan_invoice__icontains=q)
                    | Q(application_order_id__icontains=q)
                    | Q(provider_reference__icontains=q)
                    | Q(customer_email__icontains=q)
                )
                .select_related('payment_application')
                .order_by('-created_at')[:50]
            )
            for txn in hubs:
                if txn.toucan_invoice in listed_invoices:
                    continue
                payments.append({
                    'invoice': txn.toucan_invoice,
                    'applicationId': txn.application_id,
                    'applicationOrderId': txn.application_order_id,
                    'amount': str(txn.amount),
                    'paymentStatus': txn.payment_status,
                    'customerEmail': txn.customer_email,
                    'createdAt': txn.created_at.strftime('%Y-%m-%d %H:%M') if txn.created_at else '',
                    'actionCode': str((txn.provider_metadata or {}).get('actionCode') or ''),
                })
        return Response({
            'orders': OrderSerializer(order_rows, many=True).data,
            'payments': payments,
        })


class AdminPaymentStatusView(APIView):
    """Ask Toucan for one payment. The invoice can belong to any application."""

    permission_classes = [IsAdminUser]

    def post(self, request):
        from django.conf import settings as dj_settings

        from apps.payment_hub.models import HubTransaction
        from apps.payment_hub.services import HubError, inquire_status

        invoice = str(request.data.get('invoice') or request.data.get('invoiceNumber') or '').strip()
        order_id = request.data.get('orderId') or request.data.get('order_id')
        if not invoice and order_id:
            from .models import PaymentTransaction
            txn_row = PaymentTransaction.objects.filter(order_id=order_id).order_by('-id').first()
            invoice = txn_row.invoice_number if txn_row else ''
        if not invoice:
            return Response({'error': 'Enter a transaction id.'}, status=status.HTTP_400_BAD_REQUEST)
        txn = HubTransaction.objects.filter(toucan_invoice=invoice).select_related(
            'payment_application', 'payment_application__provider_profile'
        ).first()
        if txn is None:
            return Response({'error': 'No payment was found for that transaction id.'}, status=status.HTTP_404_NOT_FOUND)
        lms_id = getattr(dj_settings, 'LMS_HUB_APPLICATION_ID', 'LMS')
        try:
            if txn.application_id == lms_id:
                from .hub_connector import refresh_lms_payment
                result = refresh_lms_payment(txn.toucan_invoice)
                message = result.get('message') or result.get('error') or ''
                txn.refresh_from_db()
            else:
                txn, message = inquire_status(txn)
        except HubError as exc:
            return Response({'error': exc.message}, status=exc.status)
        return Response({
            'success': txn.payment_status == 'SUCCESS',
            'invoice': txn.toucan_invoice,
            'applicationId': txn.application_id,
            'applicationOrderId': txn.application_order_id,
            'paymentStatus': txn.payment_status,
            'actionCode': str((txn.provider_metadata or {}).get('actionCode') or ''),
            'message': message,
        })


class ToucanInitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        course_ids = request.data.get('courseIds') or request.data.get('course_ids', [])
        coupon_code = (request.data.get('couponCode') or request.data.get('coupon_code', '')).strip().upper()
        customer_name = request.data.get('name') or user.get_full_name() or user.username
        customer_phone = request.data.get('phone') or ''
        customer_email = request.data.get('email') or user.email

        # Retrieve courses
        if course_ids:
            valid_int_ids = [int(cid) for cid in course_ids if str(cid).isdigit()]
            slug_ids = [str(cid) for cid in course_ids if not str(cid).isdigit()]
            courses = list(Course.objects.filter(id__in=valid_int_ids))
            if slug_ids:
                courses += list(Course.objects.filter(slug__in=slug_ids))
        else:
            cart_items = CartItem.objects.filter(user=user).select_related('course')
            courses = [item.course for item in cart_items]

        if not courses:
            return Response({'error': 'No valid courses found in cart to purchase'}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate purchase of already enrolled courses
        from apps.learning.models import Enrollment
        already_enrolled = list(
            Enrollment.objects.filter(user=user, course__in=courses, is_active=True)
            .values_list('course__title', flat=True)
        )
        if already_enrolled:
            return Response({
                'error': f"You are already enrolled in: {', '.join(already_enrolled)}. Duplicate purchases are not allowed."
            }, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum(Decimal('0.00') if c.is_free or not c.price else Decimal(str(c.price)) for c in courses)
        discount = Decimal('0.00')

        coupon_obj = None
        if coupon_code:
            try:
                coupon_obj = Coupon.objects.get(code=coupon_code, active=True)
                if coupon_obj.expires_at >= timezone.now().date() and coupon_obj.used_count < coupon_obj.max_uses:
                    discount = (subtotal * Decimal(str(coupon_obj.discount_percent))) / Decimal('100.00')
            except Coupon.DoesNotExist:
                pass

        total = max(Decimal('0.00'), subtotal - discount)
        from .models import PaymentTransaction
        stale = Order.objects.filter(user=user, status='pending')
        PaymentTransaction.objects.filter(order__in=stale).exclude(status='success').update(status='failed')
        stale.update(status='cancelled')

        order_num = f"ORD-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
        invoice_num = f"INV-{timezone.now().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

        # Create Order with status 'pending'
        order = Order.objects.create(
            order_number=order_num,
            user=user,
            subtotal=subtotal,
            discount=discount,
            total=total,
            coupon_code=coupon_code if coupon_obj else '',
            payment_method='ToucanPay Official Gateway',
            status='pending',
            invoice_number=invoice_num,
            billing_name=(customer_name or '')[:200],
            billing_phone=''.join(ch for ch in str(customer_phone) if ch.isdigit())[-10:],
            billing_email=(customer_email or '')[:254],
        )

        for course in courses:
            instructor_name = getattr(course.instructor, 'first_name', '') + ' ' + getattr(course.instructor, 'last_name', '')
            if not instructor_name.strip():
                instructor_name = course.instructor.username

            OrderItem.objects.create(
                order=order,
                course=course,
                price_at_purchase=course.price,
                course_title=course.title,
                thumbnail=course.thumbnail or '',
                instructor_name=instructor_name.strip()
            )

        if total == 0:
            from .tax_invoice import assign_tax_invoice_number

            order.status = 'completed'
            order.payment_method = 'Free enrollment'
            order.save(update_fields=['status', 'payment_method'])
            assign_tax_invoice_number(order)
            for item in order.items.all():
                _, created = Enrollment.objects.get_or_create(
                    user=user, course=item.course, defaults={'is_active': True}
                )
                if created:
                    type(item.course).objects.filter(pk=item.course_id).update(student_count=F('student_count') + 1)
            if coupon_obj:
                type(coupon_obj).objects.filter(pk=coupon_obj.pk).update(used_count=F('used_count') + 1)
            CartItem.objects.filter(user=user, course__in=courses).delete()
            return Response({
                'success': True,
                'free': True,
                'orderId': order.id,
                'order': OrderSerializer(order).data,
            })

        from .toucanpay_service import ToucanPayService
        init_res = ToucanPayService.initiate_payment(
            order=order,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            public_base=request.build_absolute_uri('/').rstrip('/'),
        )

        if not init_res.get('success'):
            return Response({'error': init_res.get('error', 'Failed to initialize ToucanPay session')}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            'success': True,
            'redirectUrl': init_res.get('redirect_url'),
            'redirect_url': init_res.get('redirect_url'),
            'invoiceNumber': init_res.get('invoice_number'),
            'invoice_number': init_res.get('invoice_number'),
            'orderId': order.id,
            'order_id': order.id,
            'orderNumber': order.order_number,
            'order_number': order.order_number,
            'isSimulated': init_res.get('is_simulated', False),
            'is_simulated': init_res.get('is_simulated', False),
            'notice': init_res.get('notice')
        }, status=status.HTTP_200_OK)


class ToucanVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        invoice_number = request.data.get('invoiceNumber') or request.data.get('invoice_number')
        order_id = request.data.get('orderId') or request.data.get('order_id')

        from .toucanpay_service import ToucanPayService
        from .models import PaymentTransaction

        transaction = None
        if invoice_number:
            transaction = PaymentTransaction.objects.filter(invoice_number=invoice_number, order__user=request.user).first()
        elif order_id:
            transaction = PaymentTransaction.objects.filter(order_id=order_id, order__user=request.user).first()

        if not transaction:
            if order_id:
                completed = Order.objects.filter(id=order_id, user=request.user, status='completed').first()
                if completed:
                    return Response({
                        'success': True,
                        'status': 'SUCCESS',
                        'order': OrderSerializer(completed).data,
                    })
            return Response({'error': 'Payment transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        if transaction.status == 'success' or transaction.order.status == 'completed':
            if transaction.order.status != 'completed':
                from .fulfillment import mark_lms_order_paid
                mark_lms_order_paid(transaction.order, transaction, {
                    'actionCode': transaction.action_code or '00',
                    'approvalCode': transaction.approval_code or '',
                    'rrn': transaction.rrn or '',
                    'custVpa': transaction.payer_vpa or '',
                })
                transaction.refresh_from_db()
            CartItem.objects.filter(user=request.user).delete()
            return Response({
                'success': True,
                'status': 'SUCCESS',
                'order': OrderSerializer(transaction.order).data,
            })

        verify_res = ToucanPayService.check_payment_status(transaction.invoice_number)
        transaction.refresh_from_db()
        if verify_res.get('success') or transaction.status == 'success' or transaction.order.status == 'completed':
            CartItem.objects.filter(user=request.user).delete()
            return Response({
                'success': True,
                'status': 'SUCCESS',
                'order': OrderSerializer(transaction.order).data
            })
        return Response({
            'success': False,
            'status': verify_res.get('status') or 'PENDING',
            'error': verify_res.get('message') or verify_res.get('error') or 'Payment is not confirmed yet. The course stays locked until ToucanPay reports success.',
        }, status=status.HTTP_400_BAD_REQUEST)


class ToucanAbandonPaymentView(APIView):
    """Learner left the ToucanPay page or the gateway declined the payment."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .models import PaymentTransaction
        invoice_number = request.data.get('invoiceNumber') or request.data.get('invoice_number') or request.data.get('invoice')
        order_id = request.data.get('orderId') or request.data.get('order_id')

        order = None
        transaction = None
        if invoice_number:
            transaction = PaymentTransaction.objects.filter(
                invoice_number=invoice_number, order__user=request.user
            ).select_related('order').first()
            order = transaction.order if transaction else None
        if order is None and order_id:
            order = Order.objects.filter(id=order_id, user=request.user).first()
            transaction = PaymentTransaction.objects.filter(order=order).order_by('-id').first() if order else None
        if order is None:
            return Response({'error': 'Payment transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status == 'completed' or (transaction and transaction.status == 'success'):
            return Response(OrderSerializer(order).data)

        if transaction and transaction.invoice_number:
            from .hub_connector import cancel_lms_payment
            cancel_lms_payment(transaction.invoice_number)

        from .fulfillment import record_lms_payment_failure
        record_lms_payment_failure(order, transaction, 'Cancelled')
        return Response(OrderSerializer(order).data)


class ToucanBrowserReturnView(APIView):
    """Toucan's browser return is a POST. Send the browser on with the order reference."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return self._redirect(request)

    def post(self, request):
        return self._redirect(request)

    def _redirect(self, request):
        from django.http import HttpResponse
        from .browser_return import browser_return_location

        response = HttpResponse(status=303)
        response['Location'] = browser_return_location(_posted(request))
        return response


def _posted(request):
    found = {}
    for source in (request.GET, request.POST):
        for key, value in source.items():
            if value not in (None, ''):
                found[key] = value
    data = request.data if isinstance(request.data, dict) else {}
    for key, value in data.items():
        if key not in found and value not in (None, ''):
            found[key] = value
    return found


class ToucanCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .toucanpay_service import ToucanPayService
        res = ToucanPayService.process_callback(
            request.data,
            remote_addr=request.META.get('REMOTE_ADDR', ''),
            forwarded_for=request.META.get('HTTP_X_FORWARDED_FOR', ''),
        )
        code = status.HTTP_200_OK if res.get('suceess', True) else status.HTTP_403_FORBIDDEN
        return Response(res, status=code)


class HubResultView(APIView):
    """Signed result from the payment hub. Enrollment stays in this connector."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .fulfillment import apply_hub_result
        from .hub_connector import verify_incoming_result
        payload = verify_incoming_result(request)
        if payload is None:
            return Response({'error': 'Rejected result.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not apply_hub_result(payload):
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'ok': True})


class TaxInvoiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from apps.orders.tax_invoice import assign_tax_invoice_number, build_tax_invoice

        order = Order.objects.filter(pk=pk).select_related('user').prefetch_related('items').first()
        if order is None:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        is_admin = request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser
        if order.user_id != request.user.id and not is_admin:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        if order.status != 'completed':
            return Response({'error': 'A tax invoice is available after the payment is completed.'}, status=status.HTTP_400_BAD_REQUEST)
        assign_tax_invoice_number(order)
        return Response(build_tax_invoice(order))

