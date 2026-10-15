from django.urls import path

from apps.payment_hub.views import (
    ApplicationDetailView,
    ApplicationListView,
    HubCallbackView,
    PaymentCancelView,
    PaymentCollectionView,
    PaymentDetailView,
    PaymentStatusCheckView,
    ProviderProfileDetailView,
    ProviderProfileListView,
    RotateCredentialView,
)

urlpatterns = [
    path('payments', PaymentCollectionView.as_view(), name='hub-payment-create'),
    path('payments/status-check', PaymentStatusCheckView.as_view(), name='hub-payment-status-check'),
    path('payments/<uuid:internal_id>', PaymentDetailView.as_view(), name='hub-payment-detail'),
    path('payments/<uuid:internal_id>/cancel', PaymentCancelView.as_view(), name='hub-payment-cancel'),
    path('providers/toucan/callback/', HubCallbackView.as_view(), name='hub-toucan-callback'),
    path('applications/', ApplicationListView.as_view(), name='hub-applications'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='hub-application-detail'),
    path('applications/<int:pk>/rotate-credential/', RotateCredentialView.as_view(), name='hub-rotate-credential'),
    path('provider-profiles/', ProviderProfileListView.as_view(), name='hub-provider-profiles'),
    path('provider-profiles/<int:pk>/', ProviderProfileDetailView.as_view(), name='hub-provider-profile-detail'),
]
