from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    courseId = serializers.CharField(source='course_id')
    courseTitle = serializers.CharField(source='course_title')
    instructorName = serializers.CharField(source='instructor_name')
    price = serializers.FloatField(source='price_at_purchase', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'courseId', 'courseTitle', 'price', 'price_at_purchase', 'thumbnail', 'instructorName']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    orderNumber = serializers.CharField(source='order_number')
    couponCode = serializers.CharField(source='coupon_code', required=False)
    paymentMethod = serializers.CharField(source='payment_method')
    invoiceNumber = serializers.CharField(source='invoice_number')
    gatewayInvoice = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%d %H:%M')
    userId = serializers.CharField(source='user_id', read_only=True)
    userEmail = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'orderNumber', 'userId', 'userEmail', 'subtotal', 'discount', 'total',
            'couponCode', 'paymentMethod', 'status', 'invoiceNumber', 'gatewayInvoice',
            'createdAt', 'items'
        ]

    def get_gatewayInvoice(self, order):
        cached = getattr(order, '_prefetched_objects_cache', {}).get('transactions')
        if cached is not None:
            txn = cached[0] if cached else None
        else:
            txn = order.transactions.order_by('-id').first()
        if txn is not None:
            return txn.invoice_number
        return order.payment_id or ''
