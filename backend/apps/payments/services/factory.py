from django.conf import settings
from .base import BasePaymentGateway
from .mock_gateway import MockPaymentGateway
from .razorpay_gateway import RazorpayPaymentGateway
from .stripe_gateway import StripePaymentGateway

GATEWAY_REGISTRY = {
    'mock': MockPaymentGateway,
    'razorpay': RazorpayPaymentGateway,
    'stripe': StripePaymentGateway,
}

def get_payment_gateway(gateway_name: str = None) -> BasePaymentGateway:
    """
    Factory function returning an instance of the configured payment gateway.
    Loosely coupled: Add new gateways to GATEWAY_REGISTRY to support any provider.
    """
    if not gateway_name:
        gateway_name = getattr(settings, 'PAYMENT_GATEWAY_DEFAULT', 'mock')

    gateway_class = GATEWAY_REGISTRY.get(gateway_name.lower(), MockPaymentGateway)
    return gateway_class()
