from django.urls import path
from .views import (
    AdminDashboardStatsView,
    PlatformSettingsView,
    InstructorAnalyticsView,
    SMTPSettingsView,
    SMTPTestEmailView,
    PaymentGatewaySettingsView,
    PaymentGatewayTestView
)

urlpatterns = [
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/settings/', PlatformSettingsView.as_view(), name='admin-settings'),
    path('admin/smtp/', SMTPSettingsView.as_view(), name='admin-smtp'),
    path('admin/smtp/test/', SMTPTestEmailView.as_view(), name='admin-smtp-test'),
    path('admin/payment-gateway/', PaymentGatewaySettingsView.as_view(), name='admin-payment-gateway'),
    path('admin/payment-gateway/test/', PaymentGatewayTestView.as_view(), name='admin-payment-gateway-test'),
    path('instructor/analytics/', InstructorAnalyticsView.as_view(), name='instructor-analytics'),
]
