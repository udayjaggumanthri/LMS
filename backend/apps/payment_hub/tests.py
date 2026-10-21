import hashlib
import hmac
import json
import time
from decimal import Decimal
from unittest.mock import MagicMock, patch
from urllib.error import URLError

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.payment_hub.bootstrap import bootstrap_registry
from apps.payment_hub.models import (
    ApplicationCredential,
    ApplicationDelivery,
    HubTransaction,
    PaymentApplication,
    ProviderProfile,
)
from apps.orders.browser_return import browser_return_location
from apps.payment_hub.services import deliver, process_callback, public_payment, retry_due_deliveries

User = get_user_model()


def signed_headers(api_key, secret, body):
    raw = json.dumps(body, separators=(',', ':'), sort_keys=True).encode('utf-8')
    timestamp = str(int(time.time()))
    signature = hmac.new(secret.encode('utf-8'), f'{timestamp}.'.encode('utf-8') + raw, hashlib.sha256).hexdigest()
    return raw, {
        'HTTP_AUTHORIZATION': f'Bearer {api_key}',
        'HTTP_X_HUB_TIMESTAMP': timestamp,
        'HTTP_X_HUB_SIGNATURE': signature,
    }


class HubContractTests(TestCase):
    def setUp(self):
        bootstrap_registry()
        self.profile = ProviderProfile.objects.create(
            code='shop-a',
            name='Shop A',
            mid='MID-A',
            tid='11110000',
            mac_token='mac-a',
            checkout_session_url='https://pay.example/session',
            status_check_url='https://pay.example/status',
            merchant_region_url='https://pay.example/region',
            approved=True,
        )
        self.other = ProviderProfile.objects.create(
            code='shop-b',
            name='Shop B',
            mid='MID-B',
            tid='22220000',
            mac_token='mac-b',
            checkout_session_url='https://pay.example/session',
            status_check_url='https://pay.example/status',
            merchant_region_url='https://pay.example/region',
            approved=True,
        )
        self.app_a = PaymentApplication.objects.create(
            application_id='shop-a',
            name='Shop A',
            enabled=True,
            base_url='https://shop-a.example',
            success_url='https://shop-a.example/paid',
            failure_url='https://shop-a.example/failed',
            result_endpoint='https://shop-a.example/result',
            provider_profile=self.profile,
        )
        self.app_b = PaymentApplication.objects.create(
            application_id='shop-b',
            name='Shop B',
            enabled=True,
            base_url='https://shop-b.example',
            success_url='https://shop-b.example/paid',
            failure_url='https://shop-b.example/failed',
            result_endpoint='https://shop-b.example/result',
            provider_profile=self.other,
        )
        self.cred_a = ApplicationCredential.issue(self.app_a)
        self.cred_b = ApplicationCredential.issue(self.app_b)
        self.user = User.objects.create_user(username='hubadmin', password='TestPassword123!', role='admin')
        self.client.force_login(self.user)

    def _mock_checkout(self):
        opener = MagicMock()
        resp = MagicMock()
        resp.status = 302
        resp.headers = {'Location': 'https://pay.example/pay?ref=1'}
        opener.open.return_value = resp
        return opener

    @patch('apps.payment_hub.providers.toucan.urllib.request.build_opener')
    def test_create_ignores_body_application_and_return_urls(self, mock_build):
        mock_build.return_value = self._mock_checkout()
        body = {
            'application_id': self.app_b.application_id,
            'application_order_id': 'order-1',
            'amount': '25.00',
            'currency': 'INR',
            'name': 'Asha',
            'phone': '9876543210',
            'email': 'asha@example.com',
            'success_url': 'https://evil.example/steal',
            'failure_url': 'https://evil.example/fail',
        }
        raw, headers = signed_headers(self.cred_a.plaintext_api_key, self.cred_a.plaintext_hmac_secret, body)
        response = self.client.post('/api/v1/payments', data=raw, content_type='application/json', **headers)
        self.assertEqual(response.status_code, 201, response.content)
        txn = HubTransaction.objects.get(application_order_id='order-1')
        self.assertEqual(txn.application_id, self.app_a.application_id)
        self.assertEqual(txn.payment_application_id, self.app_a.id)
        posted = mock_build.return_value.open.call_args[0][0].data.decode()
        self.assertIn('t=11110000', posted)
        self.assertIn('surl=https%3A%2F%2Fshop-a.example%2Fpaid', posted)
        self.assertNotIn('evil.example', posted)
        self.assertIn('name=Asha', posted)
        self.assertIn('phone=9876543210', posted)
        self.assertIn('emailId=asha%40example.com', posted)
        self.assertNotIn('mpayhub', posted.lower())
        self.assertNotIn('empire', posted.lower())
        self.assertNotIn('partner', posted.lower())
        ua = mock_build.return_value.open.call_args[0][0].headers.get('User-agent') or ''
        self.assertIn('Prajnadhara-LMS', ua)
        self.assertNotIn('mPayHub', ua)
        txn.refresh_from_db()
        public = public_payment(txn)
        self.assertEqual(public['name'], 'Asha')
        self.assertEqual(public['phone'], '9876543210')
        self.assertEqual(public['email'], 'asha@example.com')
        self.assertEqual(response.json().get('name'), 'Asha')
        self.assertEqual(response.json().get('email'), 'asha@example.com')

    def test_create_rejects_empty_name(self):
        body = {
            'application_order_id': 'order-noname',
            'amount': '10',
            'name': '  ',
            'phone': '9876543210',
            'email': 'asha@example.com',
        }
        raw, headers = signed_headers(self.cred_a.plaintext_api_key, self.cred_a.plaintext_hmac_secret, body)
        response = self.client.post('/api/v1/payments', data=raw, content_type='application/json', **headers)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(HubTransaction.objects.filter(application_order_id='order-noname').exists())

    def test_create_rejects_placeholder_email(self):
        body = {
            'application_order_id': 'order-placeholder',
            'amount': '10',
            'name': 'Asha',
            'phone': '9876543210',
            'email': 'legacy-1@contact.placeholder',
        }
        raw, headers = signed_headers(self.cred_a.plaintext_api_key, self.cred_a.plaintext_hmac_secret, body)
        response = self.client.post('/api/v1/payments', data=raw, content_type='application/json', **headers)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(HubTransaction.objects.filter(application_order_id='order-placeholder').exists())

    def test_admin_payment_search_includes_customer_fields(self):
        HubTransaction.objects.create(
            payment_application=self.app_a,
            application_id=self.app_a.application_id,
            application_order_id='order-admin-search',
            toucan_invoice='0101202612000077777',
            amount=Decimal('42.00'),
            payment_status=HubTransaction.PaymentStatus.PENDING,
            customer_name='Ravi Kumar',
            customer_phone='9123456780',
            customer_email='ravi@example.com',
        )
        by_phone = self.client.get('/api/admin/payments/', {'q': '9123456780'})
        self.assertEqual(by_phone.status_code, 200, by_phone.content)
        payments = by_phone.json().get('payments') or []
        self.assertTrue(payments)
        row = next(p for p in payments if p['invoice'] == '0101202612000077777')
        self.assertEqual(row['customerName'], 'Ravi Kumar')
        self.assertEqual(row['customerPhone'], '9123456780')
        self.assertEqual(row['customerEmail'], 'ravi@example.com')
        by_name = self.client.get('/api/admin/payments/', {'q': 'Ravi'})
        self.assertTrue(any(p['invoice'] == '0101202612000077777' for p in by_name.json().get('payments') or []))

    def test_disabled_application_is_rejected(self):
        self.app_a.enabled = False
        self.app_a.save(update_fields=['enabled'])
        body = {
            'application_order_id': 'order-2',
            'amount': '10',
            'name': 'Asha',
            'phone': '9876543210',
            'email': 'asha@example.com',
        }
        raw, headers = signed_headers(self.cred_a.plaintext_api_key, self.cred_a.plaintext_hmac_secret, body)
        response = self.client.post('/api/v1/payments', data=raw, content_type='application/json', **headers)
        self.assertEqual(response.status_code, 403)
        self.assertFalse(HubTransaction.objects.filter(application_order_id='order-2').exists())

    def test_unknown_callback_is_acknowledged(self):
        response = self.client.post('/api/payments/toucan/callback/', {
            'pspRefNo': 'does-not-exist',
            'status': 'SUCCESS',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('suceess'))

    def test_callback_allowlist_rejects_other_ips(self):
        txn = HubTransaction.objects.create(
            payment_application=self.app_a,
            application_id=self.app_a.application_id,
            application_order_id='order-ip',
            toucan_invoice='0101202612000012345',
            amount=Decimal('10.00'),
            payment_status=HubTransaction.PaymentStatus.PENDING,
        )
        self.profile.callback_ip_allowlist = '203.0.113.10'
        self.profile.save(update_fields=['callback_ip_allowlist'])
        response = self.client.post(
            '/api/payments/toucan/callback/',
            {'pspRefNo': txn.toucan_invoice, 'status': 'SUCCESS'},
            content_type='application/json',
            REMOTE_ADDR='198.51.100.4',
        )
        self.assertEqual(response.status_code, 403)
        txn.refresh_from_db()
        self.assertEqual(txn.payment_status, HubTransaction.PaymentStatus.PENDING)

    @patch('apps.payment_hub.services.urllib.request.urlopen')
    def test_delivery_retries_without_losing_success(self, mock_urlopen):
        mock_urlopen.side_effect = URLError('down')
        txn = HubTransaction.objects.create(
            payment_application=self.app_a,
            application_id=self.app_a.application_id,
            application_order_id='order-retry',
            toucan_invoice='0101202612000099999',
            amount=Decimal('15.00'),
            payment_status=HubTransaction.PaymentStatus.SUCCESS,
            delivery_status=HubTransaction.DeliveryStatus.PENDING,
        )
        deliver(txn)
        txn.refresh_from_db()
        self.assertEqual(txn.payment_status, HubTransaction.PaymentStatus.SUCCESS)
        self.assertEqual(txn.delivery_status, HubTransaction.DeliveryStatus.RETRYING)
        self.assertEqual(ApplicationDelivery.objects.filter(transaction=txn).count(), 1)

        ok = MagicMock()
        ok.status = 200
        ok.__enter__.return_value = ok
        mock_urlopen.side_effect = None
        mock_urlopen.return_value = ok
        txn.next_delivery_at = timezone.now()
        txn.save(update_fields=['next_delivery_at'])
        retry_due_deliveries()
        txn.refresh_from_db()
        self.assertEqual(txn.delivery_status, HubTransaction.DeliveryStatus.DELIVERED)

    def test_duplicate_callback_does_not_change_a_final_status(self):
        txn = HubTransaction.objects.create(
            payment_application=self.app_a,
            application_id=self.app_a.application_id,
            application_order_id='order-final',
            toucan_invoice='0101202612000088888',
            amount=Decimal('8.00'),
            payment_status=HubTransaction.PaymentStatus.FAILED,
        )
        payload = {'pspRefNo': txn.toucan_invoice, 'status': 'SUCCESS'}
        self.assertTrue(process_callback(payload).get('suceess'))
        self.assertTrue(process_callback(payload).get('suceess'))
        txn.refresh_from_db()
        self.assertEqual(txn.payment_status, HubTransaction.PaymentStatus.FAILED)

    def test_admin_can_disable_an_application_without_code(self):
        response = self.client.patch(
            f'/api/v1/applications/{self.app_b.id}/',
            data=json.dumps({'enabled': False}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.app_b.refresh_from_db()
        self.assertFalse(self.app_b.enabled)
        listed = self.client.get('/api/v1/applications/')
        ids = {row['applicationId'] for row in listed.json()}
        self.assertIn('shop-b', ids)
        self.assertTrue(any(not row['hasCredential'] or row['keyPrefix'] for row in listed.json()))
        self.assertNotIn('hmacSecret', listed.content.decode())

    @patch('apps.payment_hub.services.deliver')
    @patch('apps.payment_hub.providers.toucan.urllib.request.urlopen')
    def test_status_check_calls_toucan_for_the_owning_application(self, mock_urlopen, _deliver):
        txn = HubTransaction.objects.create(
            payment_application=self.app_a,
            application_id=self.app_a.application_id,
            application_order_id='order-check',
            toucan_invoice='1210202612000011111',
            amount=Decimal('58.00'),
            payment_status=HubTransaction.PaymentStatus.PENDING,
        )
        payload = {
            'success': True,
            'object': {
                'actionCode': '00',
                'rrn': '529512865850',
                'invoiceNumber': txn.toucan_invoice,
            },
        }
        resp = MagicMock()
        resp.read.return_value = json.dumps(payload).encode('utf-8')
        resp.__enter__.return_value = resp
        mock_urlopen.return_value = resp

        raw, headers = signed_headers(
            self.cred_a.plaintext_api_key,
            self.cred_a.plaintext_hmac_secret,
            {'invoice': txn.toucan_invoice},
        )
        response = self.client.post(
            '/api/v1/payments/status-check',
            data=raw,
            content_type='application/json',
            **headers,
        )
        self.assertEqual(response.status_code, 200, response.content)
        txn.refresh_from_db()
        self.assertEqual(txn.payment_status, HubTransaction.PaymentStatus.SUCCESS)
        posted = json.loads(mock_urlopen.call_args[0][0].data.decode())
        self.assertEqual(posted['messageID'], '/api/pay/v1/checkStatus')
        self.assertEqual(posted['object']['invoiceNumber'], txn.toucan_invoice)
        self.assertEqual(posted['object']['terminalNumber'], self.profile.tid)
        self.assertEqual(posted['object']['merchantNumber'], self.profile.mid)

        raw_b, headers_b = signed_headers(
            self.cred_b.plaintext_api_key,
            self.cred_b.plaintext_hmac_secret,
            {'invoice': txn.toucan_invoice},
        )
        hidden = self.client.post(
            '/api/v1/payments/status-check',
            data=raw_b,
            content_type='application/json',
            **headers_b,
        )
        self.assertEqual(hidden.status_code, 404)

    @patch('apps.payment_hub.services.inquire_status', side_effect=lambda txn: (txn, 'ok'))
    def test_browser_return_never_uses_another_open_payment(self, _inquire):
        first = HubTransaction.objects.create(
            payment_application=self.app_a,
            application_id=self.app_a.application_id,
            application_order_id='student-1',
            toucan_invoice='141020261200000000000001',
            amount=Decimal('100.00'),
            payment_status=HubTransaction.PaymentStatus.SUCCESS,
        )
        second = HubTransaction.objects.create(
            payment_application=self.app_b,
            application_id=self.app_b.application_id,
            application_order_id='retailer-2',
            toucan_invoice='141020261200000000000002',
            amount=Decimal('500.00'),
            payment_status=HubTransaction.PaymentStatus.SUCCESS,
        )

        self.assertIn('unmatched=1', browser_return_location({}))
        located = browser_return_location({'invoice': first.toucan_invoice})
        self.assertIn('shop-a.example/paid', located)
        self.assertIn('student-1', located)
        self.assertNotIn('retailer-2', located)
        self.assertNotIn('shop-b.example', located)

        HubTransaction.objects.filter(pk__in=[first.pk, second.pk]).update(application_order_id='shared-ref')
        self.assertIn('unmatched=1', browser_return_location({'orderId': 'shared-ref'}))
