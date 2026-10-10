from rest_framework import serializers
from apps.courses.serializers import CourseListSerializer
from .models import Coupon, CartItem

class CouponSerializer(serializers.ModelSerializer):
    discountPercent = serializers.IntegerField(source='discount_percent')
    maxUses = serializers.IntegerField(source='max_uses')
    usedCount = serializers.IntegerField(source='used_count', read_only=True)
    expiresAt = serializers.DateField(source='expires_at')

    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discountPercent', 'course', 'maxUses', 'usedCount', 'expiresAt', 'active']


class CartItemSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    courseId = serializers.CharField(source='course.id', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'courseId', 'course', 'created_at']
