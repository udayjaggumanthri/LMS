from rest_framework import serializers
from .models import PlatformSettings, SMTPSettings, PaymentGatewaySettings, PayoutRequest

class PlatformSettingsSerializer(serializers.ModelSerializer):
    platformName = serializers.CharField(source='platform_name')
    siteTitle = serializers.CharField(source='site_title', required=False)
    logoUrl = serializers.CharField(source='logo_url', required=False, allow_blank=True)
    faviconUrl = serializers.CharField(source='favicon_url', required=False, allow_blank=True)
    supportEmail = serializers.EmailField(source='support_email')
    instructorRevenueSharePercent = serializers.IntegerField(source='instructor_revenue_share_percent', required=False)
    platformFeePercent = serializers.IntegerField(source='platform_fee_percent', required=False)
    gstRatePercent = serializers.IntegerField(source='gst_rate_percent', required=False)
    legalName = serializers.CharField(source='legal_name', required=False, allow_blank=True)
    companyLine = serializers.CharField(source='company_line', required=False, allow_blank=True)
    invoiceAddress = serializers.CharField(source='invoice_address', required=False, allow_blank=True)
    invoicePhone = serializers.CharField(source='invoice_phone', required=False, allow_blank=True)
    invoiceEmail = serializers.EmailField(source='invoice_email', required=False, allow_blank=True)
    gstNumber = serializers.CharField(source='gst_number', required=False, allow_blank=True)
    invoiceDeclaration = serializers.CharField(source='invoice_declaration', required=False, allow_blank=True)
    signatureUrl = serializers.CharField(source='signature_url', required=False, allow_blank=True)
    stampUrl = serializers.CharField(source='stamp_url', required=False, allow_blank=True)
    invoiceNextNumber = serializers.IntegerField(source='invoice_next_number', required=False, min_value=1)
    currencySymbol = serializers.CharField(source='currency_symbol', required=False)
    autoApproveInstructors = serializers.BooleanField(source='auto_approve_instructors', required=False)
    allowInstructorRegistration = serializers.BooleanField(source='allow_instructor_registration', required=False)
    maintenanceMode = serializers.BooleanField(source='maintenance_mode', required=False)

    class Meta:
        model = PlatformSettings
        fields = [
            'platformName', 'siteTitle', 'logoUrl', 'faviconUrl', 'supportEmail',
            'instructorRevenueSharePercent', 'platformFeePercent', 'gstRatePercent',
            'legalName', 'companyLine', 'invoiceAddress', 'invoicePhone', 'invoiceEmail',
            'gstNumber', 'invoiceDeclaration', 'signatureUrl', 'stampUrl', 'invoiceNextNumber',
            'currency', 'currencySymbol', 'autoApproveInstructors',
            'allowInstructorRegistration', 'maintenanceMode'
        ]


class SMTPSettingsSerializer(serializers.ModelSerializer):
    fromEmail = serializers.EmailField(source='from_email')
    senderName = serializers.CharField(source='sender_name')
    useTls = serializers.BooleanField(source='use_tls')
    useSsl = serializers.BooleanField(source='use_ssl')
    isEnabled = serializers.BooleanField(source='is_enabled')
    sendWelcomeEmail = serializers.BooleanField(source='send_welcome_email')
    sendPurchaseReceipt = serializers.BooleanField(source='send_purchase_receipt')
    sendCourseUpdates = serializers.BooleanField(source='send_course_updates')

    class Meta:
        model = SMTPSettings
        fields = [
            'host', 'port', 'username', 'password', 'fromEmail',
            'senderName', 'useTls', 'useSsl', 'isEnabled',
            'sendWelcomeEmail', 'sendPurchaseReceipt', 'sendCourseUpdates'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.password:
            data['passwordMasked'] = True
            data['password'] = '••••••••••••'
        else:
            data['passwordMasked'] = False
            data['password'] = ''
        return data

    def update(self, instance, validated_data):
        new_password = validated_data.get('password')
        if not new_password or new_password.startswith('•'):
            validated_data.pop('password', None)
        return super().update(instance, validated_data)


class PaymentGatewaySettingsSerializer(serializers.ModelSerializer):
    providerName = serializers.CharField(source='provider_name', required=False)
    isEnabled = serializers.BooleanField(source='is_enabled', required=False)
    merchantName = serializers.CharField(source='merchant_name', required=False)
    loginId = serializers.CharField(source='login_id', required=False, allow_blank=True)
    macToken = serializers.CharField(source='mac_token', required=False, allow_blank=True)
    checkoutSessionUrl = serializers.CharField(source='checkout_session_url', required=False, allow_blank=True)
    statusCheckUrl = serializers.CharField(source='status_check_url', required=False, allow_blank=True)
    merchantPortalUrl = serializers.CharField(source='merchant_portal_url', required=False, allow_blank=True)
    merchantRegionUrl = serializers.CharField(source='merchant_region_url', required=False, allow_blank=True)
    successUrl = serializers.CharField(source='success_url', required=False, allow_blank=True)
    failureUrl = serializers.CharField(source='failure_url', required=False, allow_blank=True)
    callbackUrl = serializers.CharField(source='callback_url', required=False, allow_blank=True)
    whitelistedIp = serializers.CharField(source='whitelisted_ip', required=False, allow_blank=True)
    allowSandboxSimulationOnTimeout = serializers.BooleanField(source='allow_sandbox_simulation_on_timeout', required=False)
    isConfigured = serializers.BooleanField(source='is_configured', read_only=True)

    class Meta:
        model = PaymentGatewaySettings
        fields = [
            'providerName', 'isEnabled', 'environment', 'merchantName', 'loginId',
            'mid', 'tid', 'password', 'macToken', 'checkoutSessionUrl', 'statusCheckUrl',
            'merchantPortalUrl',
            'merchantRegionUrl', 'successUrl', 'failureUrl', 'callbackUrl',
            'whitelistedIp', 'allowSandboxSimulationOnTimeout', 'isConfigured'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.password:
            data['passwordMasked'] = True
            data['password'] = '••••••••••••'
        else:
            data['passwordMasked'] = False
            data['password'] = ''

        if instance.mac_token:
            data['hasMacToken'] = True
            data['macTokenMasked'] = True
            data['macToken'] = '••••••••' + (instance.mac_token[-8:] if len(instance.mac_token) >= 8 else '')
        else:
            data['hasMacToken'] = False
            data['macTokenMasked'] = False
            data['macToken'] = ''

        return data

    def validate(self, attrs):
        for key in ('success_url', 'failure_url', 'callback_url', 'checkout_session_url', 'status_check_url', 'merchant_portal_url', 'merchant_region_url'):
            value = (attrs.get(key) or '').strip()
            if value and not value.startswith(('http://', 'https://')):
                raise serializers.ValidationError({
                    key: 'Enter a full address starting with http:// or https://.'
                })
            if key in attrs:
                attrs[key] = value
        return attrs

    def update(self, instance, validated_data):
        new_password = validated_data.get('password')
        if not new_password or new_password.startswith('•'):
            validated_data.pop('password', None)

        new_mac = validated_data.get('mac_token')
        if not new_mac or new_mac.startswith('•'):
            validated_data.pop('mac_token', None)

        return super().update(instance, validated_data)


class PayoutRequestSerializer(serializers.ModelSerializer):
    instructorId = serializers.CharField(source='instructor_id', read_only=True)
    instructorName = serializers.SerializerMethodField()
    instructorEmail = serializers.CharField(source='instructor.email', read_only=True)
    requestedAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%d', read_only=True)
    processedAt = serializers.DateTimeField(source='processed_at', format='%Y-%m-%d', allow_null=True, read_only=True)

    class Meta:
        model = PayoutRequest
        fields = [
            'id', 'instructorId', 'instructorName', 'instructorEmail',
            'amount', 'method', 'status', 'requestedAt', 'processedAt',
        ]

    def get_instructorName(self, obj):
        full = f"{obj.instructor.first_name} {obj.instructor.last_name}".strip()
        return full or obj.instructor.username

