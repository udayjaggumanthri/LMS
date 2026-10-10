from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.courses.models import Course

class Order(TimeStampedModel):
    order_number = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    coupon_code = models.CharField(max_length=50, blank=True, default='')
    payment_method = models.CharField(max_length=50, default='card')
    payment_id = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=30, default='completed')  # Irrevocable digital access; no refund policy
    invoice_number = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} ({self.user.username})"


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    course_title = models.CharField(max_length=255)
    thumbnail = models.URLField(max_length=500)
    instructor_name = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.order.order_number} - {self.course_title}"


class PaymentTransaction(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    invoice_number = models.CharField(max_length=100, unique=True)  # min 15 digits
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(
        max_length=30,
        default='initiated',
        choices=[
            ('initiated', 'Initiated'),
            ('pending', 'Pending Verification'),
            ('success', 'Success'),
            ('failed', 'Failed'),
        ]
    )
    gateway_provider = models.CharField(max_length=50, default='toucanpay')
    terminal_id = models.CharField(max_length=50, blank=True, default='')
    session_redirect_url = models.TextField(blank=True, default='')

    # PG metadata from callback / status check
    rrn = models.CharField(max_length=100, blank=True, default='')
    txn_id = models.CharField(max_length=150, blank=True, default='')
    psp_ref_no = models.CharField(max_length=150, blank=True, default='')
    approval_code = models.CharField(max_length=100, blank=True, default='')
    action_code = models.CharField(max_length=50, blank=True, default='')
    payer_vpa = models.CharField(max_length=150, blank=True, default='')
    raw_response = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} ({self.status}) - ₹{self.amount}"
