from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, ValidateCouponView, AdminCouponViewSet

router = DefaultRouter()
router.register(r'admin/coupons', AdminCouponViewSet, basename='admin-coupons')

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/validate-coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('', include(router.urls)),
]
