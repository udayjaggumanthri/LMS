from django.test import TestCase, Client
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from apps.courses.models import Course, Category
from apps.orders.models import Order, OrderItem, PaymentTransaction
from apps.admin_governance.models import PaymentGatewaySettings
from apps.orders.toucanpay_service import ToucanPayService
from apps.learning.models import Enrollment

User = get_user_model()

class ToucanPayIntegrationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='toucantester',
            email='toucantest@example.com',
            password='TestPassword123!',
            first_name='Toucan',
            last_name='Tester'
        )
        self.category = Category.objects.create(name='Technology', slug='tech-test')
        self.course = Course.objects.create(
            instructor=self.user,
            title='Fullstack Payment Integration',
            slug='fullstack-payment-integration',
            subtitle='Mastering PG architecture',
            price=1999.00,
            category=self.category,
            status='published'
        )
        self.client = Client()
        self.client.force_login(self.user)

    def test_ha_hash_matches_toucanpay_spec(self):
        """Page 4 of Payment CheckoutPage Integration spec explicitly gives amount 23"""
        expected_hash = "6ff334e1051a09e90127ba4e309e026bb830163a2ce3a355af2ce2310ff6e7e9830d20196a3472bfc8632fd3b60cb56102a84fae70ab1a32942055eb40022225"
        computed = ToucanPayService.generate_hash_amount("23")
        self.assertEqual(computed, expected_hash)

    def test_invoice_number_length(self):
        """ToucanPay specification requires invoice number 'o' to have minimum 15 digits"""
        inv = ToucanPayService.generate_invoice_number()
        self.assertGreaterEqual(len(inv), 15)
        self.assertTrue(inv.isdigit())

    def test_payment_gateway_settings_singleton(self):
        settings = PaymentGatewaySettings.get_settings()
        self.assertEqual(settings.mid, "962042872713381")
        self.assertEqual(settings.tid, "78183008")
        self.assertTrue(settings.is_enabled)

    @patch('apps.orders.toucanpay_service.urllib.request.build_opener')
    def test_initiate_payment_flow(self, mock_build_opener):
        mock_opener = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status = 302
        mock_resp.headers = {'Location': 'https://payuat.toucanpay.com/payment?ref=UAT_MOCK_123'}
        mock_opener.open.return_value = mock_resp
        mock_build_opener.return_value = mock_opener

        response = self.client.post('/api/payments/toucan/initiate/', {
            'course_ids': [self.course.id],
            'phone': '9876543210'
        }, content_type='application/json')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('redirect_url', data)
        self.assertIn('invoice_number', data)
        self.assertIn('order_id', data)

        order = Order.objects.get(id=data['order_id'])
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.total, 1999.00)

        tx = PaymentTransaction.objects.get(invoice_number=data['invoice_number'])
        self.assertEqual(tx.order, order)
        self.assertEqual(tx.status, 'pending')

    @patch('apps.orders.toucanpay_service.urllib.request.build_opener')
    def test_verify_payment_and_enrollment(self, mock_build_opener):
        mock_opener = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status = 302
        mock_resp.headers = {'Location': 'https://payuat.toucanpay.com/payment?ref=UAT_MOCK_123'}
        mock_opener.open.return_value = mock_resp
        mock_build_opener.return_value = mock_opener

        # Initiate first
        init_res = self.client.post('/api/payments/toucan/initiate/', {
            'course_ids': [self.course.id]
        }, content_type='application/json')
        invoice_number = init_res.json()['invoice_number']
        order_id = init_res.json()['order_id']

        # Verify with simulation confirm
        verify_res = self.client.post('/api/payments/toucan/verify/', {
            'invoice_number': invoice_number,
            'simulate_confirm': True
        }, content_type='application/json')

        self.assertEqual(verify_res.status_code, 200)
        v_data = verify_res.json()
        self.assertTrue(v_data.get('success'))
        self.assertEqual(v_data.get('status'), 'SUCCESS')

        # Check order status is completed
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, 'completed')

        # Check enrollment created
        self.assertTrue(Enrollment.objects.filter(user=self.user, course=self.course, is_active=True).exists())

    @patch('apps.orders.toucanpay_service.urllib.request.build_opener')
    def test_webhook_callback(self, mock_build_opener):
        mock_opener = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status = 302
        mock_resp.headers = {'Location': 'https://payuat.toucanpay.com/payment?ref=UAT_MOCK_123'}
        mock_opener.open.return_value = mock_resp
        mock_build_opener.return_value = mock_opener

        init_res = self.client.post('/api/payments/toucan/initiate/', {
            'course_ids': [self.course.id]
        }, content_type='application/json')
        invoice_number = init_res.json()['invoice_number']
        order_id = init_res.json()['order_id']

        # Send webhook payload mimicking ToucanPay notification
        callback_res = self.client.post('/api/payments/toucan/callback/', {
            'pspRefNo': invoice_number,
            'status': 'SUCCESS',
            'amount': '1999.00',
            'rrn': 'RRN-99887766'
        }, content_type='application/json')

        self.assertEqual(callback_res.status_code, 200)
        cb_data = callback_res.json()
        self.assertTrue(cb_data.get('suceess')) # ToucanPay document specifies {"suceess": true}

        order = Order.objects.get(id=order_id)
        self.assertEqual(order.status, 'completed')
        self.assertTrue(Enrollment.objects.filter(user=self.user, course=self.course).exists())

