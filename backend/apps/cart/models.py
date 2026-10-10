from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.courses.models import Course

class Coupon(TimeStampedModel):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.IntegerField(default=20)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='coupons')
    max_uses = models.IntegerField(default=1000)
    used_count = models.IntegerField(default=0)
    expires_at = models.DateField()
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.discount_percent}%)"


class CartItem(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='in_carts')

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"
