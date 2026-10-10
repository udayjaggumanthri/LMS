from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.courses.models import Category, Course
from apps.cms.models import Page, PageSection
from apps.payments.services.factory import get_payment_gateway
from apps.payments.services.mock_gateway import MockPaymentGateway
from apps.payments.services.razorpay_gateway import RazorpayPaymentGateway
from apps.payments.services.stripe_gateway import StripePaymentGateway

class LMSBackendTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='teststudent',
            email='teststudent@example.com',
            password='Password123!',
            role='student'
        )

    def test_health_check(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')

    def test_jwt_authentication(self):
        response = self.client.post('/api/auth/token/', {
            'username': 'teststudent',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        # Profile access with token
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        profile_res = self.client.get('/api/auth/profile/')
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data['username'], 'teststudent')

    def test_payment_gateway_provider_architecture(self):
        # 1. Test Mock Gateway Provider
        mock_gw = get_payment_gateway('mock')
        self.assertIsInstance(mock_gw, MockPaymentGateway)
        order_res = mock_gw.create_order('ORD-TEST-1', 1499.00, 'INR')
        self.assertEqual(order_res['gateway'], 'mock')
        self.assertTrue(mock_gw.verify_payment(order_res))

        # 2. Test Razorpay Gateway Provider
        razorpay_gw = get_payment_gateway('razorpay')
        self.assertIsInstance(razorpay_gw, RazorpayPaymentGateway)
        rzp_order = razorpay_gw.create_order('ORD-TEST-2', 1499.00, 'INR')
        self.assertEqual(rzp_order['gateway'], 'razorpay')

        # 3. Test Stripe Gateway Provider
        stripe_gw = get_payment_gateway('stripe')
        self.assertIsInstance(stripe_gw, StripePaymentGateway)
        stripe_order = stripe_gw.create_order('ORD-TEST-3', 1499.00, 'INR')
        self.assertEqual(stripe_order['gateway'], 'stripe')

    def test_cms_dynamic_page_endpoints(self):
        page = Page.objects.create(
            slug='test-landing',
            title='Test Landing Page'
        )
        PageSection.objects.create(
            page=page,
            section_key='hero',
            section_name='Hero Section',
            title='Dynamic Heading Title',
            subtitle='Dynamic Subheading Copy',
            media_url='https://example.com/banner.jpg'
        )

        response = self.client.get('/api/cms/pages/test-landing/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sectionMap', response.data)
        self.assertEqual(response.data['sectionMap']['hero']['title'], 'Dynamic Heading Title')
