from django.urls import path
from .views import (
    AdminDashboardStatsView,
    PlatformSettingsView,
    InstructorAnalyticsView,
    SMTPSettingsView,
    SMTPTestEmailView,
    EmailTemplateListView,
    EmailTemplateDetailView,
    PaymentGatewaySettingsView,
    PaymentGatewayTestView,
    InstructorPayoutListCreateView,
    AdminPayoutListView,
    AdminPayoutActionView,
)

urlpatterns = [
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('settings/', PlatformSettingsView.as_view(), name='public-settings'),
    path('admin/settings/', PlatformSettingsView.as_view(), name='admin-settings'),
    path('admin/smtp/', SMTPSettingsView.as_view(), name='admin-smtp'),
    path('admin/smtp/test/', SMTPTestEmailView.as_view(), name='admin-smtp-test'),
    path('admin/email-templates/', EmailTemplateListView.as_view(), name='admin-email-templates'),
    path('admin/email-templates/<str:key>/', EmailTemplateDetailView.as_view(), name='admin-email-template'),
    path('admin/payment-gateway/', PaymentGatewaySettingsView.as_view(), name='admin-payment-gateway'),
    path('admin/payment-gateway/test/', PaymentGatewayTestView.as_view(), name='admin-payment-gateway-test'),
    path('instructor/analytics/', InstructorAnalyticsView.as_view(), name='instructor-analytics'),
    path('instructor/payouts/', InstructorPayoutListCreateView.as_view(), name='instructor-payouts'),
    path('admin/payouts/', AdminPayoutListView.as_view(), name='admin-payouts'),
    path('admin/payouts/<int:pk>/<str:action_name>/', AdminPayoutActionView.as_view(), name='admin-payout-action'),
]
