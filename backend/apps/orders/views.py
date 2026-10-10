import uuid
import time
from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from apps.core.permissions import IsAdminUser
from apps.courses.models import Course
from apps.cart.models import CartItem, Coupon
from apps.payments.services.factory import get_payment_gateway
from .models import Order, OrderItem
from .serializers import OrderSerializer

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        course_ids = request.data.get('courseIds', [])
        coupon_code = request.data.get('couponCode', '').strip().upper()
        payment_method = request.data.get('paymentMethod', 'card')

        # Gather target courses from cart or payload
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
            return Response({'error': 'No valid courses found to checkout'}, status=status.HTTP_400_BAD_REQUEST)

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

        subtotal = sum(Decimal(str(c.price)) for c in courses)
        discount = Decimal('0.00')

        # Coupon calculation
        coupon_obj = None
        if coupon_code:
            try:
                coupon_obj = Coupon.objects.get(code=coupon_code, active=True)
                if coupon_obj.expires_at >= timezone.now().date() and coupon_obj.used_count < coupon_obj.max_uses:
                    discount = (subtotal * Decimal(str(coupon_obj.discount_percent))) / Decimal('100.00')
                    coupon_obj.used_count += 1
                    coupon_obj.save()
            except Coupon.DoesNotExist:
                pass

        total = max(Decimal('0.00'), subtotal - discount)
        order_num = f"ORD-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
        invoice_num = f"INV-{timezone.now().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

        # Initialize Payment Gateway
        gateway = get_payment_gateway()
        gw_res = gateway.create_order(
            order_id=order_num,
            amount=float(total),
            currency='INR',
            customer_info={'email': user.email, 'name': user.username}
        )

        # Create Order (all sales final, no refund policy)
        order = Order.objects.create(
            order_number=order_num,
            user=user,
            subtotal=subtotal,
            discount=discount,
            total=total,
            coupon_code=coupon_code if coupon_obj else '',
            payment_method=payment_method,
            payment_id=gw_res.get('payment_id', f"PAY-{uuid.uuid4().hex[:8].upper()}"),
            status='completed',
            invoice_number=invoice_num
        )

        # Create Order Items and Enroll User
        from apps.learning.models import Enrollment
        for course in courses:
            instructor_name = getattr(course.instructor, 'first_name', '') + ' ' + getattr(course.instructor, 'last_name', '')
            if not instructor_name.strip():
                instructor_name = course.instructor.username

            OrderItem.objects.create(
                order=order,
                course=course,
                price_at_purchase=course.price,
                course_title=course.title,
                thumbnail=course.thumbnail,
                instructor_name=instructor_name.strip()
            )

            # Auto-enroll student
            Enrollment.objects.get_or_create(user=user, course=course)
            course.student_count += 1
            course.save(update_fields=['student_count'])

        # Clear cart
        CartItem.objects.filter(user=user).delete()

        # Send automated purchase confirmation email & tax receipt
        try:
            from apps.core.email_service import EmailService
            EmailService.send_purchase_receipt(user, order)
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Order processed and curriculum enrollment active.',
            'order': OrderSerializer(order).data,
            'gateway': gw_res
        }, status=status.HTTP_201_CREATED)


class MyOrdersListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminOrdersViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().prefetch_related('items', 'user')
    serializer_class = OrderSerializer


class ToucanInitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        course_ids = request.data.get('courseIds') or request.data.get('course_ids', [])
        coupon_code = (request.data.get('couponCode') or request.data.get('coupon_code', '')).strip().upper()
        customer_name = request.data.get('name', user.get_full_name() or user.username)
        customer_phone = request.data.get('phone', '9876543210')
        customer_email = request.data.get('email', user.email)

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

        subtotal = sum(Decimal(str(c.price)) for c in courses)
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
            invoice_number=invoice_num
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
                thumbnail=course.thumbnail,
                instructor_name=instructor_name.strip()
            )

        from .toucanpay_service import ToucanPayService
        init_res = ToucanPayService.initiate_payment(
            order=order,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email
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
        simulate_confirm = request.data.get('simulateConfirm', False) or request.data.get('simulate_confirm', False)

        from .toucanpay_service import ToucanPayService
        from .models import PaymentTransaction

        transaction = None
        if invoice_number:
            transaction = PaymentTransaction.objects.filter(invoice_number=invoice_number).first()
        elif order_id:
            transaction = PaymentTransaction.objects.filter(order_id=order_id).first()

        if not transaction:
            return Response({'error': 'Payment transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        from apps.admin_governance.models import PaymentGatewaySettings
        pg_settings = PaymentGatewaySettings.get_settings()

        # If transaction already marked successful or simulate_confirm passed
        if simulate_confirm or transaction.status == 'success':
            ToucanPayService.mark_transaction_successful(transaction, {
                'actionCode': '00',
                'approvalCode': '076298',
                'rrn': f"UAT{int(time.time())}",
                'custVpa': 'learner@upi'
            })
            CartItem.objects.filter(user=request.user).delete()
            return Response({
                'success': True,
                'status': 'SUCCESS',
                'order': OrderSerializer(transaction.order).data
            })

        # Check with ToucanPay status check API
        verify_res = ToucanPayService.check_payment_status(transaction.invoice_number)
        if verify_res.get('success'):
            CartItem.objects.filter(user=request.user).delete()
            return Response({
                'success': True,
                'status': 'SUCCESS',
                'order': OrderSerializer(transaction.order).data
            })
        elif pg_settings.environment == 'uat' and transaction.order.user == request.user:
            # In UAT environment, when learner returns from ToucanPay checkout session, finalize order & provision
            ToucanPayService.mark_transaction_successful(transaction, {
                'actionCode': '00',
                'approvalCode': 'UAT-CONFIRMED',
                'rrn': f"UAT{int(time.time())}",
                'custVpa': 'learner@okaxis'
            })
            CartItem.objects.filter(user=request.user).delete()
            return Response({
                'success': True,
                'status': 'SUCCESS',
                'order': OrderSerializer(transaction.order).data
            })
        else:
            return Response({
                'success': False,
                'status': verify_res.get('status', 'FAILED'),
                'error': verify_res.get('error', 'Payment verification failed')
            }, status=status.HTTP_400_BAD_REQUEST)


class ToucanCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .toucanpay_service import ToucanPayService
        res = ToucanPayService.process_callback(request.data)
        return Response(res, status=status.HTTP_200_OK)

