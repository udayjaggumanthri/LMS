from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CheckoutView,
    MyOrdersListView,
    AdminOrdersViewSet,
    ToucanInitiatePaymentView,
    ToucanVerifyPaymentView,
    ToucanCallbackView,
)

router = DefaultRouter()
router.register(r'admin/orders', AdminOrdersViewSet, basename='admin-orders')

urlpatterns = [
    path('orders/checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/my-orders/', MyOrdersListView.as_view(), name='my-orders'),
    path('payments/toucan/initiate/', ToucanInitiatePaymentView.as_view(), name='toucan-initiate'),
    path('payments/toucan/verify/', ToucanVerifyPaymentView.as_view(), name='toucan-verify'),
    path('payments/toucan/callback/', ToucanCallbackView.as_view(), name='toucan-callback'),
    path('', include(router.urls)),
]
