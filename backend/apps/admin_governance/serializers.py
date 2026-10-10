from rest_framework import serializers
from .models import PlatformSettings, SMTPSettings, PaymentGatewaySettings

class PlatformSettingsSerializer(serializers.ModelSerializer):
    platformName = serializers.CharField(source='platform_name')
    supportEmail = serializers.EmailField(source='support_email')
    instructorRevenueSharePercent = serializers.IntegerField(source='instructor_revenue_share_percent', required=False)
    platformFeePercent = serializers.IntegerField(source='platform_fee_percent', required=False)
    gstRatePercent = serializers.IntegerField(source='gst_rate_percent', required=False)
    currencySymbol = serializers.CharField(source='currency_symbol', required=False)
    autoApproveInstructors = serializers.BooleanField(source='auto_approve_instructors', required=False)
    allowInstructorRegistration = serializers.BooleanField(source='allow_instructor_registration', required=False)
    maintenanceMode = serializers.BooleanField(source='maintenance_mode', required=False)

    class Meta:
        model = PlatformSettings
        fields = [
            'platformName', 'supportEmail', 'instructorRevenueSharePercent',
            'platformFeePercent', 'gstRatePercent', 'currency', 'currencySymbol',
            'autoApproveInstructors', 'allowInstructorRegistration', 'maintenanceMode'
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
    apiEndpointUat = serializers.CharField(source='api_endpoint_uat', required=False)
    apiEndpointProd = serializers.CharField(source='api_endpoint_prod', required=False)
    statusCheckEndpointUat = serializers.CharField(source='status_check_endpoint_uat', required=False)
    statusCheckEndpointProd = serializers.CharField(source='status_check_endpoint_prod', required=False)
    merchantPortalUrl = serializers.CharField(source='merchant_portal_url', required=False)
    merchantRegionUrl = serializers.CharField(source='merchant_region_url', required=False)
    successUrl = serializers.CharField(source='success_url', required=False)
    failureUrl = serializers.CharField(source='failure_url', required=False)
    callbackUrl = serializers.CharField(source='callback_url', required=False)
    whitelistedIp = serializers.CharField(source='whitelisted_ip', required=False, allow_blank=True)
    allowSandboxSimulationOnTimeout = serializers.BooleanField(source='allow_sandbox_simulation_on_timeout', required=False)
    isConfigured = serializers.BooleanField(source='is_configured', read_only=True)

    class Meta:
        model = PaymentGatewaySettings
        fields = [
            'providerName', 'isEnabled', 'environment', 'merchantName', 'loginId',
            'mid', 'tid', 'password', 'macToken', 'apiEndpointUat', 'apiEndpointProd',
            'statusCheckEndpointUat', 'statusCheckEndpointProd', 'merchantPortalUrl',
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

    def update(self, instance, validated_data):
        new_password = validated_data.get('password')
        if not new_password or new_password.startswith('•'):
            validated_data.pop('password', None)

        new_mac = validated_data.get('mac_token')
        if not new_mac or new_mac.startswith('•'):
            validated_data.pop('mac_token', None)

        return super().update(instance, validated_data)

