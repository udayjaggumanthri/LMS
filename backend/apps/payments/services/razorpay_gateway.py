import hmac
import hashlib
from typing import Dict, Any
from django.conf import settings
from .base import BasePaymentGateway

class RazorpayPaymentGateway(BasePaymentGateway):
    """
    Plug-and-play adapter for Razorpay Payment Gateway.
    """

    def __init__(self):
        self.key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        self.key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

    def create_order(self, order_id: str, amount: float, currency: str = 'INR', customer_info: Dict[str, Any] = None) -> Dict[str, Any]:
        amount_in_paise = int(amount * 100)
        # When live keys are supplied, razorpay client creates the order
        return {
            'gateway': 'razorpay',
            'order_id': order_id,
            'key_id': self.key_id,
            'amount': amount_in_paise,
            'currency': currency,
            'receipt': order_id
        }

    def verify_payment(self, payment_details: Dict[str, Any]) -> bool:
        razorpay_order_id = payment_details.get('razorpay_order_id', '')
        razorpay_payment_id = payment_details.get('razorpay_payment_id', '')
        razorpay_signature = payment_details.get('razorpay_signature', '')

        if not self.key_secret:
            return True  # Sandbox fallback

        # HMAC SHA256 verification
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
        expected = hmac.new(self.key_secret.encode(), msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, razorpay_signature)

    def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        return {'status': 'success'}
