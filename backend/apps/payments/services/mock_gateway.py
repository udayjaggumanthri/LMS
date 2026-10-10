import uuid
from typing import Dict, Any
from .base import BasePaymentGateway

class MockPaymentGateway(BasePaymentGateway):
    """
    Default mock payment provider for zero-friction local development and testing.
    """

    def create_order(self, order_id: str, amount: float, currency: str = 'INR', customer_info: Dict[str, Any] = None) -> Dict[str, Any]:
        simulated_payment_id = f"mock_pay_{uuid.uuid4().hex[:12]}"
        return {
            'gateway': 'mock',
            'order_id': order_id,
            'payment_id': simulated_payment_id,
            'amount': amount,
            'currency': currency,
            'status': 'created',
            'client_token': f"token_{uuid.uuid4().hex[:16]}"
        }

    def verify_payment(self, payment_details: Dict[str, Any]) -> bool:
        # Mock payment succeeds as long as a payment_id is provided or simulated
        return True

    def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        return {'status': 'success', 'event': payload.get('event', 'payment.captured')}
