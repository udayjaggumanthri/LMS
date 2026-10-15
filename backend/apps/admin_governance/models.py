import os
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.encryption import EncryptedTextField, EncryptedCharField

class PlatformSettings(TimeStampedModel):
    key = models.CharField(max_length=100, unique=True, default='global')
    platform_name = models.CharField(max_length=150, default='PrajnadharaEdu')
    site_title = models.CharField(max_length=200, default='PrajnadharaEdu')
    logo_url = models.CharField(max_length=500, blank=True, default='')
    favicon_url = models.CharField(max_length=500, blank=True, default='')
    support_email = models.EmailField(default='support@prajnadhara.edu')
    
    # Financial Economics
    instructor_revenue_share_percent = models.IntegerField(default=70)
    platform_fee_percent = models.IntegerField(default=30)
    gst_rate_percent = models.IntegerField(default=18)
    legal_name = models.CharField(max_length=150, default='Prajnadhara')
    company_line = models.CharField(max_length=150, default='Infotech Pvt Ltd')
    invoice_address = models.TextField(
        default='1st Floor, 7-28-6, Tanvi Castle, Tyaga Raja Nagar, Rajamahendravaram, East Godavari, Andhra Pradesh, 533101.',
    )
    invoice_phone = models.CharField(max_length=40, default='+91 9052513666')
    invoice_email = models.EmailField(default='info@prajnadharainfotech.com')
    gst_number = models.CharField(max_length=20, default='37AAQCP8786M1Z4')
    invoice_declaration = models.TextField(
        default='We declare that this invoice reflects the actual price of the services described and that all particulars are true and correct.',
    )
    signature_url = models.CharField(max_length=500, blank=True, default='')
    stamp_url = models.CharField(max_length=500, blank=True, default='')
    invoice_next_number = models.PositiveIntegerField(default=1)
    currency = models.CharField(max_length=10, default='INR')
    currency_symbol = models.CharField(max_length=5, default='₹')
    
    # Operational switches
    auto_approve_instructors = models.BooleanField(default=False)
    allow_instructor_registration = models.BooleanField(default=False)
    maintenance_mode = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Platform Settings'

    def __str__(self):
        return f"Settings ({self.platform_name})"


class SMTPSettings(TimeStampedModel):
    key = models.CharField(max_length=100, unique=True, default='global')
    host = models.CharField(max_length=255, default='smtp.gmail.com')
    port = models.IntegerField(default=587)
    username = models.CharField(max_length=255, blank=True, default='')
    password = EncryptedCharField(max_length=500, blank=True, default='')
    from_email = models.EmailField(default='noreply@prajnadhara.edu')
    sender_name = models.CharField(max_length=150, default='PrajnadharaEdu')
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    is_enabled = models.BooleanField(default=False)

    # Automated Notification Toggles
    send_welcome_email = models.BooleanField(default=True)
    send_purchase_receipt = models.BooleanField(default=True)
    send_course_updates = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'SMTP Settings'

    def __str__(self):
        return f"SMTP ({self.host}:{self.port} - {'Active' if self.is_enabled else 'Disabled'})"


class EmailTemplate(TimeStampedModel):
    key = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    subject = models.CharField(max_length=255)
    body_html = models.TextField()
    enabled = models.BooleanField(default=True)
    placeholders = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['label']

    def __str__(self):
        return self.label


class PaymentGatewaySettings(TimeStampedModel):
    key = models.CharField(max_length=100, unique=True, default='toucanpay')
    provider_name = models.CharField(max_length=100, default='ToucanPay')
    is_enabled = models.BooleanField(default=True)
    environment = models.CharField(
        max_length=20,
        default='uat',
        choices=[('uat', 'UAT / Sandbox'), ('production', 'Production')]
    )
    
    # Merchant Credentials - Dynamically configured by Admin & Encrypted in Database
    merchant_name = models.CharField(max_length=255, default='Prajnadhara Learning Platform')
    login_id = models.CharField(max_length=100, blank=True, default='')
    mid = models.CharField(max_length=100, blank=True, default='')
    tid = models.CharField(max_length=100, blank=True, default='')
    password = EncryptedCharField(max_length=500, blank=True, default='')
    mac_token = EncryptedTextField(blank=True, default='')

    # One set of addresses. Admin replaces these when the gateway profile changes.
    checkout_session_url = models.CharField(max_length=500, blank=True, default='')
    status_check_url = models.CharField(max_length=500, blank=True, default='')
    api_endpoint_uat = models.CharField(max_length=255, blank=True, default='')
    api_endpoint_prod = models.CharField(max_length=255, blank=True, default='')
    status_check_endpoint_uat = models.CharField(max_length=255, blank=True, default='')
    status_check_endpoint_prod = models.CharField(max_length=255, blank=True, default='')
    merchant_portal_url = models.CharField(max_length=500, blank=True, default='')
    merchant_region_url = models.CharField(max_length=500, blank=True, default='')

    # Redirection & Webhook URLs
    success_url = models.CharField(max_length=500, blank=True, default='')
    failure_url = models.CharField(max_length=500, blank=True, default='')
    callback_url = models.CharField(max_length=500, blank=True, default='')
    whitelisted_ip = models.CharField(max_length=100, blank=True, default='')

    # Operational safety
    allow_sandbox_simulation_on_timeout = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Payment Gateway Settings'

    @classmethod
    def get_settings(cls):
        settings, created = cls.objects.get_or_create(key='toucanpay')
        if created:
            # Fallback to environment variables if provided
            env_mid = os.getenv('TOUCANPAY_MID', '')
            env_tid = os.getenv('TOUCANPAY_TID', '')
            env_mac = os.getenv('TOUCANPAY_MAC_TOKEN', '')
            env_pwd = os.getenv('TOUCANPAY_PASSWORD', '')
            env_login = os.getenv('TOUCANPAY_LOGIN_ID', '')
            if env_mid:
                settings.mid = env_mid
            if env_tid:
                settings.tid = env_tid
            if env_mac:
                settings.mac_token = env_mac
            if env_pwd:
                settings.password = env_pwd
            if env_login:
                settings.login_id = env_login
            settings.save()
        return settings

    @property
    def is_configured(self):
        """Returns True if minimum required gateway credentials are configured."""
        return bool(self.mid and self.tid and self.mac_token and (self.checkout_session_url or '').strip())

    def __str__(self):
        return f"Payment Gateway ({self.provider_name} - {self.environment.upper()})"


class PayoutRequest(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        REJECTED = 'rejected', 'Rejected'

    instructor = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='payout_requests'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payout {self.id} {self.status}"
