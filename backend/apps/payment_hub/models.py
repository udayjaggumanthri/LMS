import hashlib
import hmac
import secrets
import uuid
from decimal import Decimal

from django.db import models

from apps.core.encryption import EncryptedCharField, EncryptedTextField
from apps.core.models import TimeStampedModel


class ProviderProfile(TimeStampedModel):
    """Merchant credentials for one provider account. Applications link to a row explicitly."""

    code = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=150)
    provider = models.CharField(max_length=40, default='toucan')
    environment = models.CharField(max_length=20, default='uat')
    merchant_name = models.CharField(max_length=255, blank=True, default='')
    mid = models.CharField(max_length=100, blank=True, default='')
    tid = models.CharField(max_length=100, blank=True, default='')
    password = EncryptedCharField(max_length=500, blank=True, default='')
    mac_token = EncryptedTextField(blank=True, default='')
    checkout_session_url = models.CharField(max_length=500, blank=True, default='')
    status_check_url = models.CharField(max_length=500, blank=True, default='')
    merchant_region_url = models.CharField(max_length=500, blank=True, default='')
    whitelisted_ip = models.CharField(max_length=100, blank=True, default='')
    callback_ip_allowlist = models.TextField(
        blank=True,
        default='',
        help_text='Comma-separated source IPs allowed to call the provider callback. Blank skips the check.',
    )
    approved = models.BooleanField(default=False)
    follow_gateway_settings = models.BooleanField(
        default=False,
        help_text='When set, the LMS connector may refresh this profile from Payment Gateway settings.',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def is_configured(self):
        return bool(self.mid and self.tid and self.mac_token and (self.checkout_session_url or '').strip())

    def callback_ips(self):
        return [part.strip() for part in (self.callback_ip_allowlist or '').split(',') if part.strip()]


class PaymentApplication(TimeStampedModel):
    application_id = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=150)
    environment = models.CharField(max_length=20, default='uat')
    base_url = models.CharField(max_length=500, blank=True, default='')
    enabled = models.BooleanField(default=False)
    success_url = models.CharField(max_length=500, blank=True, default='')
    failure_url = models.CharField(max_length=500, blank=True, default='')
    result_endpoint = models.CharField(max_length=500, blank=True, default='')
    timeout_seconds = models.PositiveIntegerField(default=10)
    retry_max = models.PositiveIntegerField(default=5)
    provider_profile = models.ForeignKey(
        ProviderProfile,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='applications',
    )
    follow_gateway_urls = models.BooleanField(
        default=False,
        help_text='When set, the LMS connector may refresh return URLs from Payment Gateway settings.',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.application_id})'

    def absolute_result_endpoint(self):
        endpoint = (self.result_endpoint or '').strip()
        if endpoint.startswith(('http://', 'https://')):
            return endpoint
        base = (self.base_url or '').rstrip('/')
        if not base or not endpoint:
            return ''
        return f'{base}/{endpoint.lstrip("/")}'


class ApplicationCredential(TimeStampedModel):
    application = models.ForeignKey(PaymentApplication, on_delete=models.CASCADE, related_name='credentials')
    key_prefix = models.CharField(max_length=16)
    key_hash = models.CharField(max_length=64, unique=True)
    api_key_encrypted = EncryptedTextField()
    hmac_secret_encrypted = EncryptedTextField()
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    @staticmethod
    def hash_key(api_key):
        return hashlib.sha256(api_key.encode('utf-8')).hexdigest()

    @classmethod
    def issue(cls, application):
        cls.objects.filter(application=application, active=True).update(active=False)
        api_key = secrets.token_urlsafe(32)
        hmac_secret = secrets.token_urlsafe(32)
        row = cls.objects.create(
            application=application,
            key_prefix=api_key[:8],
            key_hash=cls.hash_key(api_key),
            api_key_encrypted=api_key,
            hmac_secret_encrypted=hmac_secret,
            active=True,
        )
        row.plaintext_api_key = api_key
        row.plaintext_hmac_secret = hmac_secret
        return row

    @property
    def api_key(self):
        return self.api_key_encrypted

    @property
    def hmac_secret(self):
        return self.hmac_secret_encrypted


class HubTransaction(TimeStampedModel):
    class PaymentStatus(models.TextChoices):
        INITIATED = 'INITIATED', 'Initiated'
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        UNKNOWN = 'UNKNOWN', 'Unknown'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class DeliveryStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        DELIVERED = 'DELIVERED', 'Delivered'
        RETRYING = 'RETRYING', 'Retrying'
        FAILED = 'FAILED', 'Failed'

    internal_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    payment_application = models.ForeignKey(PaymentApplication, on_delete=models.PROTECT, related_name='transactions')
    application_id = models.CharField(max_length=64)
    environment = models.CharField(max_length=20, default='uat')
    application_order_id = models.CharField(max_length=100)
    toucan_invoice = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED)
    delivery_status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    provider_reference = models.CharField(max_length=150, blank=True, default='')
    poll_count = models.PositiveSmallIntegerField(default=0)
    delivery_attempt_count = models.PositiveSmallIntegerField(default=0)
    customer_name = models.CharField(max_length=150, blank=True, default='')
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    customer_email = models.CharField(max_length=254, blank=True, default='')
    redirect_url = models.TextField(blank=True, default='')
    idempotency_key = models.CharField(max_length=120, null=True, blank=True)
    raw_provider = models.JSONField(default=dict, blank=True)
    provider_metadata = models.JSONField(default=dict, blank=True)
    next_delivery_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['payment_application', 'application_order_id'],
                name='uniq_hub_application_order',
            ),
            models.UniqueConstraint(
                fields=['payment_application', 'idempotency_key'],
                condition=models.Q(idempotency_key__isnull=False),
                name='uniq_hub_idempotency',
            ),
        ]

    def __str__(self):
        return f'{self.toucan_invoice} {self.payment_status}'


class CallbackEvent(TimeStampedModel):
    transaction = models.ForeignKey(
        HubTransaction, null=True, blank=True, on_delete=models.SET_NULL, related_name='callback_events'
    )
    fingerprint = models.CharField(max_length=64, unique=True)
    payload = models.JSONField(default=dict, blank=True)
    remote_ip = models.CharField(max_length=80, blank=True, default='')
    accepted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']


class ApplicationDelivery(TimeStampedModel):
    transaction = models.ForeignKey(HubTransaction, on_delete=models.CASCADE, related_name='deliveries')
    attempt = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=20, default='PENDING')
    response_code = models.PositiveIntegerField(null=True, blank=True)
    error = models.TextField(blank=True, default='')


def fingerprint_payload(payload):
    raw = json_canonical(payload)
    return hashlib.sha256(raw).hexdigest()


def json_canonical(payload):
    import json
    return json.dumps(payload, separators=(',', ':'), sort_keys=True, default=str).encode('utf-8')


def sign_body(secret, timestamp, body):
    message = f'{timestamp}.'.encode('utf-8') + body
    return hmac.new(secret.encode('utf-8'), message, hashlib.sha256).hexdigest()


def amount_decimal(value):
    dec = Decimal(str(value))
    return dec.quantize(Decimal('0.01'))
