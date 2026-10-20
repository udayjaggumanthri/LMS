from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.core.permissions import IsAdminUser, IsInstructor
from apps.users.models import User
from apps.courses.models import Course, Category
from apps.orders.models import Order
from apps.learning.models import Enrollment
from .models import PlatformSettings
from .serializers import PlatformSettingsSerializer

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_students = User.objects.filter(role='student').count()
        total_instructors = User.objects.filter(role='instructor').count()
        
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(status='published').count()
        in_review_courses = Course.objects.filter(status='in_review').count()
        
        orders = Order.objects.filter(status='completed')
        total_gmv = sum(float(o.total) for o in orders)
        
        return Response({
            'totalUsers': total_users,
            'totalStudents': total_students,
            'totalInstructors': total_instructors,
            'totalCourses': total_courses,
            'publishedCourses': published_courses,
            'inReviewCourses': in_review_courses,
            'totalOrders': orders.count(),
            'totalRevenue': total_gmv,
            'totalGMV': total_gmv,
        })


class SMTPSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .models import SMTPSettings
        from .serializers import SMTPSettingsSerializer
        smtp, _ = SMTPSettings.objects.get_or_create(key='global')
        return Response(SMTPSettingsSerializer(smtp).data)

    def put(self, request):
        from .models import SMTPSettings
        from .serializers import SMTPSettingsSerializer
        smtp, _ = SMTPSettings.objects.get_or_create(key='global')
        data = request.data.copy()
        if data.get('password') == '••••••••••••':
            data.pop('password', None)
        serializer = SMTPSettingsSerializer(smtp, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SMTPSettingsSerializer(smtp).data)


class SMTPTestEmailView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        to_email = request.data.get('testEmail') or request.user.email
        if not to_email:
            return Response({'error': 'Recipient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.core.email_service import EmailService
        subject = "PrajnadharaEdu – SMTP Configuration Verification"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #064e3b; margin-top: 0;">PrajnadharaEdu SMTP Test</h2>
            <p>Congratulations! Your SMTP email service is correctly configured and successfully delivering notifications.</p>
            <p style="font-size: 13px; color: #475569;"><strong>Verified By:</strong> {request.user.email}</p>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Automated test notification from Platform Admin Center.</p>
        </div>
        """
        result = EmailService.send_email(to_email, subject, html)
        if result.get('success'):
            return Response(result)
        return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailTemplateListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .models import EmailTemplate
        from apps.core.email_defaults import seed_email_templates
        seed_email_templates()
        order = ['welcome', 'purchase_receipt', 'password_reset', 'payment_failed']
        rows = list(EmailTemplate.objects.all())
        rows.sort(key=lambda row: order.index(row.key) if row.key in order else len(order))
        return Response([_template_payload(row) for row in rows])


class EmailTemplateDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, key):
        from .models import EmailTemplate
        from apps.core.email_defaults import seed_email_templates
        seed_email_templates()
        row = EmailTemplate.objects.filter(key=key).first()
        if row is None:
            return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)
        if 'subject' in request.data:
            row.subject = str(request.data.get('subject') or '')[:255]
        if 'bodyHtml' in request.data or 'body_html' in request.data:
            row.body_html = str(request.data.get('bodyHtml', request.data.get('body_html')) or '')
        if 'enabled' in request.data:
            row.enabled = bool(request.data.get('enabled'))
        if 'label' in request.data and str(request.data.get('label') or '').strip():
            row.label = str(request.data.get('label')).strip()[:150]
        row.save()
        return Response(_template_payload(row))

    def post(self, request, key):
        from apps.core.email_service import EmailService
        from .models import EmailTemplate
        row = EmailTemplate.objects.filter(key=key).first()
        if row is None:
            return Response({'error': 'Template not found.'}, status=status.HTTP_404_NOT_FOUND)
        to_email = request.data.get('testEmail') or request.user.email
        if not to_email:
            return Response({'error': 'Recipient email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        samples = {
            'name': 'Student',
            'catalog_url': 'https://uat.prajnadharaedu.com/courses',
            'order_number': 'ORD-1001',
            'items': '<tr><td style="padding:8px;font-size:13px;">Sample course</td><td style="padding:8px;text-align:right;">₹1.00</td></tr>',
            'total': '₹1.00',
            'learning_url': 'https://uat.prajnadharaedu.com/student/my-learning',
            'reset_url': 'https://uat.prajnadharaedu.com/reset-password',
            'status': 'Failed',
            'checkout_url': 'https://uat.prajnadharaedu.com/checkout',
        }
        sample = {name: samples.get(name, '') for name in (row.placeholders or [])}
        subject, html = EmailService.render_template(row, sample)
        result = EmailService.send_email(to_email, subject, html)
        if result.get('success'):
            return Response(result)
        return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _template_payload(row):
    return {
        'key': row.key,
        'label': row.label,
        'description': row.description,
        'subject': row.subject,
        'bodyHtml': row.body_html,
        'enabled': row.enabled,
        'placeholders': row.placeholders or [],
    }


class PlatformSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        settings_obj, _ = PlatformSettings.objects.get_or_create(key='global')
        serializer = PlatformSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        settings_obj, _ = PlatformSettings.objects.get_or_create(key='global')
        serializer = PlatformSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class InstructorAnalyticsView(APIView):
    permission_classes = [IsInstructor]

    def get(self, request):
        courses = Course.objects.filter(instructor=request.user)
        total_students = sum(c.student_count for c in courses)
        avg_rating = sum(c.rating for c in courses) / courses.count() if courses.exists() else 0
        
        return Response({
            'courseCount': courses.count(),
            'totalStudents': total_students,
            'averageRating': round(avg_rating, 2),
            'totalEarnings': float(request.user.total_earnings),
        })


class PaymentGatewaySettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .models import PaymentGatewaySettings
        from .serializers import PaymentGatewaySettingsSerializer
        pg, _ = PaymentGatewaySettings.objects.get_or_create(key='toucanpay')
        return Response(PaymentGatewaySettingsSerializer(pg).data)

    def put(self, request):
        from .models import PaymentGatewaySettings
        from .serializers import PaymentGatewaySettingsSerializer
        pg, _ = PaymentGatewaySettings.objects.get_or_create(key='toucanpay')
        data = request.data.copy()
        if data.get('password') == '••••••••••••':
            data.pop('password', None)
        serializer = PaymentGatewaySettingsSerializer(pg, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        pg.refresh_from_db()
        from apps.payment_hub.bootstrap import sync_from_gateway_settings
        sync_from_gateway_settings()
        return Response(PaymentGatewaySettingsSerializer(pg).data)


class PaymentGatewayTestView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        import json, time, urllib.request, urllib.parse, hashlib
        from .models import PaymentGatewaySettings

        pg, _ = PaymentGatewaySettings.objects.get_or_create(key='toucanpay')
        if not pg.is_configured:
            return Response({
                'success': False,
                'status': 'UNCONFIGURED',
                'message': 'Cannot test connection: Terminal ID, Merchant ID, or MAC Token is missing. Please save valid credentials first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        from apps.orders.toucanpay_service import NoRedirectHandler, failure_message_from_location

        test_amount = str(request.data.get('testAmount', '10'))
        test_inv = f"{int(time.time() * 1000):015d}"
        ha = hashlib.sha512(test_amount.encode()).hexdigest()

        endpoint = (pg.checkout_session_url or '').strip()
        murl = (pg.merchant_region_url or '').strip()
        if not endpoint or not murl:
            return Response({
                'success': False,
                'status': 'UNCONFIGURED',
                'message': 'Set the checkout address and merchant region URL, then save, before testing.',
            }, status=status.HTTP_400_BAD_REQUEST)
        phone = ''.join(ch for ch in str(request.data.get('phone') or '') if ch.isdigit())[-10:]

        payload = {
            't': (pg.tid or '').strip(),
            'o': test_inv,
            'ta': test_amount,
            'c': 'INR',
            'mac': (pg.mac_token or '').strip(),
            'murl': murl,
            'name': 'Prajnadhara Admin Test',
            'phone': phone,
            'emailId': request.user.email,
            'ha': ha
        }

        post_data = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(
            endpoint,
            data=post_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        opener = urllib.request.build_opener(NoRedirectHandler)

        try:
            response = opener.open(req, timeout=15)
            headers = dict(response.headers)
            loc = headers.get('Location') or headers.get('location')
            if not loc:
                body = response.read().decode('utf-8', errors='ignore')
                try:
                    parsed = json.loads(body) if body else {}
                except Exception:
                    parsed = {}
                loc = parsed.get('Location') or parsed.get('location') or ''
            rejected = failure_message_from_location(loc)
            if rejected:
                return Response({
                    'success': False,
                    'status': 'SESSION_REJECTED',
                    'statusCode': response.status,
                    'environment': pg.environment,
                    'endpoint': endpoint,
                    'message': rejected,
                    'notice': rejected,
                })
            checkout = bool(loc) and '/auth/failure/' not in loc
            return Response({
                'success': checkout,
                'status': 'CONNECTED' if checkout else 'NO_LOCATION',
                'statusCode': response.status,
                'environment': pg.environment,
                'endpoint': endpoint,
                'locationHeader': loc or None,
                'message': 'ToucanPay returned a checkout location.' if checkout else 'ToucanPay responded without a checkout location.',
                'notice': 'ToucanPay returned a checkout location.' if checkout else 'ToucanPay responded without a checkout location.',
            })
        except urllib.error.HTTPError as e:
            headers = dict(e.headers)
            loc = headers.get('Location') or headers.get('location') or ''
            rejected = failure_message_from_location(loc)
            checkout = bool(loc) and not rejected
            notice = rejected or f'ToucanPay responded with HTTP {e.code}: {e.reason}'
            return Response({
                'success': checkout,
                'status': 'CONNECTED' if checkout else f'HTTP_{e.code}',
                'locationHeader': loc or None,
                'environment': pg.environment,
                'endpoint': endpoint,
                'message': notice,
                'notice': notice,
            })
        except Exception as ex:
            server_ip = (pg.whitelisted_ip or '').strip()
            host = endpoint.split('/')[2] if '://' in endpoint else endpoint
            where = f' from {server_ip}' if server_ip else ''
            notice = f'Could not reach the saved checkout address at {host}{where}.'
            return Response({
                'success': False,
                'status': 'UNREACHABLE',
                'whitelistedIp': server_ip,
                'endpoint': endpoint,
                'environment': pg.environment,
                'error': str(ex),
                'message': notice,
                'notice': notice,
            }, status=status.HTTP_200_OK)


class InstructorPayoutListCreateView(APIView):
    permission_classes = [IsInstructor]

    def get(self, request):
        from .models import PayoutRequest
        from .serializers import PayoutRequestSerializer
        rows = PayoutRequest.objects.filter(instructor=request.user).select_related('instructor')
        return Response(PayoutRequestSerializer(rows, many=True).data)

    def post(self, request):
        from decimal import Decimal, InvalidOperation
        from .models import PayoutRequest
        from .serializers import PayoutRequestSerializer
        method = (request.data.get('method') or '').strip()
        try:
            amount = Decimal(str(request.data.get('amount')))
        except (InvalidOperation, TypeError):
            return Response({'error': 'Enter a payout amount.'}, status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0:
            return Response({'error': 'Payout amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)
        if not method:
            return Response({'error': 'Enter a payout method.'}, status=status.HTTP_400_BAD_REQUEST)
        row = PayoutRequest.objects.create(instructor=request.user, amount=amount, method=method)
        return Response(PayoutRequestSerializer(row).data, status=status.HTTP_201_CREATED)


class AdminPayoutListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .models import PayoutRequest
        from .serializers import PayoutRequestSerializer
        rows = PayoutRequest.objects.select_related('instructor')
        return Response(PayoutRequestSerializer(rows, many=True).data)


class AdminPayoutActionView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk, action_name):
        from django.utils import timezone
        from .models import PayoutRequest
        from .serializers import PayoutRequestSerializer
        row = PayoutRequest.objects.filter(pk=pk).select_related('instructor').first()
        if not row:
            return Response({'error': 'Payout request not found.'}, status=status.HTTP_404_NOT_FOUND)
        if action_name == 'approve':
            row.status = PayoutRequest.Status.COMPLETED
        elif action_name == 'reject':
            row.status = PayoutRequest.Status.REJECTED
        else:
            return Response({'error': 'Unknown payout action.'}, status=status.HTTP_400_BAD_REQUEST)
        row.processed_at = timezone.now()
        row.save(update_fields=['status', 'processed_at'])
        return Response(PayoutRequestSerializer(row).data)

