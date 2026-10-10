from typing import Dict, Any
from django.conf import settings
from .base import BasePaymentGateway

class StripePaymentGateway(BasePaymentGateway):
    """
    Plug-and-play adapter for Stripe Payment Gateway.
    """

    def __init__(self):
        self.api_key = getattr(settings, 'STRIPE_API_KEY', '')

    def create_order(self, order_id: str, amount: float, currency: str = 'INR', customer_info: Dict[str, Any] = None) -> Dict[str, Any]:
        amount_in_cents = int(amount * 100)
        return {
            'gateway': 'stripe',
            'order_id': order_id,
            'client_secret': f"pi_mock_{order_id}_secret",
            'amount': amount_in_cents,
            'currency': currency.lower()
        }

    def verify_payment(self, payment_details: Dict[str, Any]) -> bool:
        return bool(payment_details.get('payment_intent_id'))

    def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        return {'status': 'success'}
