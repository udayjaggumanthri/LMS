from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CheckoutView,
    MyOrdersListView,
    AdminOrdersViewSet,
    ToucanInitiatePaymentView,
    ToucanVerifyPaymentView,
    ToucanAbandonPaymentView,
    ToucanCallbackView,
    ToucanBrowserReturnView,
    HubResultView,
    TaxInvoiceView,
    AdminPaymentSearchView,
    AdminPaymentStatusView,
)

router = DefaultRouter()
router.register(r'admin/orders', AdminOrdersViewSet, basename='admin-orders')

urlpatterns = [
    path('orders/checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/my-orders/', MyOrdersListView.as_view(), name='my-orders'),
    path('orders/<int:pk>/invoice/', TaxInvoiceView.as_view(), name='order-tax-invoice'),
    path('payments/toucan/initiate/', ToucanInitiatePaymentView.as_view(), name='toucan-initiate'),
    path('payments/toucan/verify/', ToucanVerifyPaymentView.as_view(), name='toucan-verify'),
    path('payments/toucan/abandon/', ToucanAbandonPaymentView.as_view(), name='toucan-abandon'),
    path('payments/toucan/callback/', ToucanCallbackView.as_view(), name='toucan-callback'),
    path('payments/toucan/browser-return/', ToucanBrowserReturnView.as_view(), name='toucan-browser-return'),
    path('payments/hub/result/', HubResultView.as_view(), name='hub-result'),
    path('admin/payments/', AdminPaymentSearchView.as_view(), name='admin-payment-search'),
    path('admin/payments/status-check/', AdminPaymentStatusView.as_view(), name='admin-payment-status'),
    path('', include(router.urls)),
]
