"""Registry bootstrap. Initial rows are data. Routing never branches on these ids."""

from django.conf import settings


LMS_PROFILE_CODE = 'gateway-settings-toucan'
PARTNER_PROFILE_CODE = 'unassigned-partner'
PARTNER_APPLICATION_ID = 'MPAYHUB'


def bootstrap_registry():
    from apps.payment_hub.models import ApplicationCredential, PaymentApplication, ProviderProfile

    lms_id = getattr(settings, 'LMS_HUB_APPLICATION_ID', 'LMS')
    profile, _ = ProviderProfile.objects.get_or_create(
        code=LMS_PROFILE_CODE,
        defaults={
            'name': 'Toucan',
            'provider': 'toucan',
            'follow_gateway_settings': True,
            'approved': False,
        },
    )
    application, _ = PaymentApplication.objects.get_or_create(
        application_id=lms_id,
        defaults={
            'name': 'LMS',
            'enabled': True,
            'environment': 'uat',
            'provider_profile': profile,
            'follow_gateway_urls': True,
            'success_url': '',
            'failure_url': '',
        },
    )
    if application.provider_profile_id is None:
        application.provider_profile = profile
        application.save(update_fields=['provider_profile'])
    if not application.credentials.filter(active=True).exists():
        ApplicationCredential.issue(application)

    partner_profile, _ = ProviderProfile.objects.get_or_create(
        code=PARTNER_PROFILE_CODE,
        defaults={
            'name': 'Unassigned provider',
            'provider': 'toucan',
            'approved': False,
            'follow_gateway_settings': False,
        },
    )
    partner, _ = PaymentApplication.objects.get_or_create(
        application_id=PARTNER_APPLICATION_ID,
        defaults={
            'name': 'mPayHub',
            'enabled': False,
            'environment': 'uat',
            'base_url': 'https://partner-uat.mpayhub.in',
            'success_url': 'https://partner-uat.mpayhub.in/payment/success',
            'failure_url': 'https://partner-uat.mpayhub.in/payment/failure',
            'result_endpoint': 'https://partner-uat.mpayhub.in/api/payment/result',
            'provider_profile': partner_profile,
            'follow_gateway_urls': False,
        },
    )
    if not partner.credentials.filter(active=True).exists():
        ApplicationCredential.issue(partner)
    return application


def sync_from_gateway_settings(public_base=''):
    """Refresh the LMS registration from Payment Gateway settings while follow flags stay on."""
    from apps.admin_governance.models import PaymentGatewaySettings
    from apps.payment_hub.models import PaymentApplication

    bootstrap_registry()
    pg = PaymentGatewaySettings.get_settings()
    lms_id = getattr(settings, 'LMS_HUB_APPLICATION_ID', 'LMS')
    application = PaymentApplication.objects.filter(application_id=lms_id).select_related('provider_profile').first()
    if application is None:
        return None
    profile = application.provider_profile
    if profile is not None and profile.follow_gateway_settings:
        profile.environment = pg.environment or profile.environment
        profile.merchant_name = pg.merchant_name
        profile.mid = pg.mid
        profile.tid = pg.tid
        profile.password = pg.password
        profile.mac_token = pg.mac_token
        profile.checkout_session_url = pg.checkout_session_url
        profile.status_check_url = pg.status_check_url
        profile.merchant_region_url = pg.merchant_region_url
        profile.whitelisted_ip = pg.whitelisted_ip
        profile.approved = bool(pg.is_enabled and pg.is_configured)
        profile.save()
    if application.follow_gateway_urls:
        base = (public_base or application.base_url or '').rstrip('/')
        success = (pg.success_url or '').strip()
        failure = (pg.failure_url or '').strip()
        if not success and base:
            success = f'{base}/order-confirmation'
        if not failure and base:
            failure = f'{base}/checkout?status=failed'
        application.success_url = success
        application.failure_url = failure
        application.environment = pg.environment or application.environment
        if base:
            application.base_url = base
            application.result_endpoint = f'{base}/api/payments/hub/result/'
        application.save()
    return application
