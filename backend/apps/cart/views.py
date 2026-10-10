from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from apps.core.permissions import IsAdminUser
from apps.courses.models import Course
from .models import Coupon, CartItem
from .serializers import CouponSerializer, CartItemSerializer

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user).select_related('course', 'course__instructor')
        serializer = CartItemSerializer(items, many=True)
        subtotal = sum(float(item.course.price) for item in items)
        return Response({
            'items': serializer.data,
            'subtotal': subtotal,
            'item_count': items.count()
        })

    def post(self, request):
        course_id = request.data.get('courseId')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if student is already enrolled in this course
        from apps.learning.models import Enrollment
        if Enrollment.objects.filter(user=request.user, course=course, is_active=True).exists():
            return Response({'error': f"You are already enrolled in '{course.title}'."}, status=status.HTTP_400_BAD_REQUEST)

        item, created = CartItem.objects.get_or_create(user=request.user, course=course)
        return Response({
            'message': 'Course added to cart',
            'created': created
        }, status=status.HTTP_201_CREATED)

    def delete(self, request):
        course_id = request.data.get('courseId')
        if course_id:
            CartItem.objects.filter(user=request.user, course_id=course_id).delete()
            return Response({'message': 'Item removed from cart'})
        else:
            CartItem.objects.filter(user=request.user).delete()
            return Response({'message': 'Cart cleared'})


class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        try:
            coupon = Coupon.objects.get(code=code, active=True)
            if coupon.expires_at < timezone.now().date():
                return Response({'success': False, 'message': 'Coupon has expired'}, status=status.HTTP_400_BAD_REQUEST)
            if coupon.used_count >= coupon.max_uses:
                return Response({'success': False, 'message': 'Coupon maximum redemptions exceeded'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'success': True,
                'coupon': CouponSerializer(coupon).data,
                'message': f'Coupon {coupon.code} applied ({coupon.discount_percent}% off)'
            })
        except Coupon.DoesNotExist:
            return Response({'success': False, 'message': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)


class AdminCouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
