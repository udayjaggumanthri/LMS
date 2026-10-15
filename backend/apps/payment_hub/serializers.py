from rest_framework import serializers

from apps.payment_hub.models import PaymentApplication, ProviderProfile


def mask_secret(value, keep=4):
    if not value:
        return ''
    tail = value[-keep:] if len(value) >= keep else ''
    return f'••••{tail}'


class ProviderProfileSerializer(serializers.ModelSerializer):
    callbackIpAllowlist = serializers.CharField(source='callback_ip_allowlist', required=False, allow_blank=True)
    checkoutSessionUrl = serializers.CharField(source='checkout_session_url', required=False, allow_blank=True)
    statusCheckUrl = serializers.CharField(source='status_check_url', required=False, allow_blank=True)
    merchantRegionUrl = serializers.CharField(source='merchant_region_url', required=False, allow_blank=True)
    whitelistedIp = serializers.CharField(source='whitelisted_ip', required=False, allow_blank=True)
    merchantName = serializers.CharField(source='merchant_name', required=False, allow_blank=True)
    macToken = serializers.CharField(source='mac_token', required=False, allow_blank=True)
    followGatewaySettings = serializers.BooleanField(source='follow_gateway_settings', required=False)
    isConfigured = serializers.BooleanField(source='is_configured', read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'code', 'name', 'provider', 'environment', 'merchantName', 'mid', 'tid',
            'password', 'macToken', 'checkoutSessionUrl', 'statusCheckUrl', 'merchantRegionUrl',
            'whitelistedIp', 'callbackIpAllowlist', 'approved', 'followGatewaySettings', 'isConfigured',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['password'] = mask_secret(instance.password) if instance.password else ''
        data['hasPassword'] = bool(instance.password)
        data['macToken'] = mask_secret(instance.mac_token, keep=4) if instance.mac_token else ''
        data['hasMacToken'] = bool(instance.mac_token)
        return data

    def update(self, instance, validated_data):
        password = validated_data.get('password')
        if password is not None and (not password or str(password).startswith('•')):
            validated_data.pop('password', None)
        mac = validated_data.get('mac_token')
        if mac is not None and (not mac or str(mac).startswith('•')):
            validated_data.pop('mac_token', None)
        if any(key in validated_data for key in ('mid', 'tid', 'mac_token', 'password', 'checkout_session_url', 'approved')):
            instance.follow_gateway_settings = validated_data.get('follow_gateway_settings', False)
        return super().update(instance, validated_data)


class PaymentApplicationSerializer(serializers.ModelSerializer):
    applicationId = serializers.SlugField(source='application_id')
    baseUrl = serializers.CharField(source='base_url', required=False, allow_blank=True)
    successUrl = serializers.CharField(source='success_url', required=False, allow_blank=True)
    failureUrl = serializers.CharField(source='failure_url', required=False, allow_blank=True)
    resultEndpoint = serializers.CharField(source='result_endpoint', required=False, allow_blank=True)
    timeoutSeconds = serializers.IntegerField(source='timeout_seconds', required=False)
    retryMax = serializers.IntegerField(source='retry_max', required=False)
    providerProfileId = serializers.PrimaryKeyRelatedField(
        source='provider_profile', queryset=ProviderProfile.objects.all(), allow_null=True, required=False
    )
    followGatewayUrls = serializers.BooleanField(source='follow_gateway_urls', required=False)

    class Meta:
        model = PaymentApplication
        fields = [
            'id', 'applicationId', 'name', 'environment', 'baseUrl', 'enabled',
            'successUrl', 'failureUrl', 'resultEndpoint', 'timeoutSeconds', 'retryMax',
            'providerProfileId', 'followGatewayUrls',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        cred = instance.credentials.filter(active=True).first() if instance.pk else None
        data['keyPrefix'] = cred.key_prefix if cred else ''
        data['hasCredential'] = cred is not None
        profile = instance.provider_profile
        data['providerApproved'] = bool(profile and profile.approved and profile.is_configured)
        data['providerProfileName'] = profile.name if profile else ''
        return data

    def update(self, instance, validated_data):
        url_fields = {'base_url', 'success_url', 'failure_url', 'result_endpoint'}
        if url_fields.intersection(validated_data):
            validated_data['follow_gateway_urls'] = validated_data.get('follow_gateway_urls', False)
        return super().update(instance, validated_data)
