from django.apps import AppConfig


class PaymentHubConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.payment_hub'
    label = 'payment_hub'
    verbose_name = 'Payment hub'
