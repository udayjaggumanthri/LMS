from abc import ABC, abstractmethod
from typing import Dict, Any

class BasePaymentGateway(ABC):
    """
    Loosely coupled payment gateway contract.
    Any new payment provider (e.g. Razorpay, Stripe, PayU, PhonePe, Cashfree)
    simply implements this interface without altering order or checkout logic.
    """

    @abstractmethod
    def create_order(self, order_id: str, amount: float, currency: str = 'INR', customer_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a payment intent / order token on the gateway.
        Returns a dict containing client parameters (e.g. gateway_order_id, public_key, currency).
        """
        pass

    @abstractmethod
    def verify_payment(self, payment_details: Dict[str, Any]) -> bool:
        """
        Verify the payment callback, token or signature.
        """
        pass

    @abstractmethod
    def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle server-to-server webhook callbacks.
        """
        pass
