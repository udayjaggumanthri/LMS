import json

from django.utils import timezone
from rest_framework import authentication, exceptions, permissions

from apps.payment_hub.models import ApplicationCredential, sign_body


class ApplicationCredentialAuthentication(authentication.BaseAuthentication):
    """Bearer application key plus HMAC of `timestamp.body`. Ignores any application id in the body."""

    www_authenticate_realm = 'payment-hub'

    def authenticate(self, request):
        header = request.META.get('HTTP_AUTHORIZATION', '')
        if not header.startswith('Bearer '):
            raise exceptions.AuthenticationFailed('Application credential required.')
        api_key = header.split(' ', 1)[1].strip()
        if not api_key:
            raise exceptions.AuthenticationFailed('Application credential required.')
        cred = (
            ApplicationCredential.objects.filter(key_hash=ApplicationCredential.hash_key(api_key), active=True)
            .select_related('application', 'application__provider_profile')
            .first()
        )
        if cred is None:
            raise exceptions.AuthenticationFailed('Unknown application credential.')
        timestamp = request.META.get('HTTP_X_HUB_TIMESTAMP', '')
        signature = request.META.get('HTTP_X_HUB_SIGNATURE', '')
        if not _timestamp_fresh(timestamp) or not signature:
            raise exceptions.AuthenticationFailed('Missing or expired signature.')
        expected = sign_body(cred.hmac_secret, timestamp, request.body or b'')
        if not _matches(expected, signature):
            raise exceptions.AuthenticationFailed('Invalid signature.')
        request.payment_application = cred.application
        return (None, cred.application)


class IsRegisteredApplication(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.auth is not None


def verify_result_signature(application, timestamp, signature, body):
    cred = application.credentials.filter(active=True).first()
    if cred is None or not _timestamp_fresh(timestamp) or not signature:
        return False
    expected = sign_body(cred.hmac_secret, timestamp, body or b'')
    return _matches(expected, signature)


def _timestamp_fresh(timestamp):
    try:
        seen = int(timestamp)
    except (TypeError, ValueError):
        return False
    now = int(timezone.now().timestamp())
    return abs(now - seen) <= 300


def _matches(expected, signature):
    import hmac
    return hmac.compare_digest(expected, (signature or '').strip())


def signed_body(secret, payload):
    raw = json.dumps(payload, separators=(',', ':'), sort_keys=True, default=str).encode('utf-8')
    timestamp = str(int(timezone.now().timestamp()))
    return raw, timestamp, sign_body(secret, timestamp, raw)
