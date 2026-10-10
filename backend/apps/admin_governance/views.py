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
        subject = "Prajnadhara EDU – SMTP Configuration Verification"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #064e3b; margin-top: 0;">Prajnadhara EDU SMTP Test</h2>
            <p>Congratulations! Your SMTP email service is correctly configured and successfully delivering notifications.</p>
            <p style="font-size: 13px; color: #475569;"><strong>Verified By:</strong> {request.user.email}</p>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Automated test notification from Platform Admin Center.</p>
        </div>
        """
        result = EmailService.send_email(to_email, subject, html)
        if result.get('success'):
            return Response(result)
        return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        avg_rating = sum(c.rating for c in courses) / len(courses) if courses.exists() else 5.0
        
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
        return Response(PaymentGatewaySettingsSerializer(pg).data)


class PaymentGatewayTestView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        import time, urllib.request, urllib.parse, hashlib
        from .models import PaymentGatewaySettings

        pg, _ = PaymentGatewaySettings.objects.get_or_create(key='toucanpay')
        if not pg.is_configured:
            return Response({
                'success': False,
                'status': 'UNCONFIGURED',
                'message': 'Cannot test connection: Terminal ID, Merchant ID, or MAC Token is missing. Please save valid credentials first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        test_amount = str(request.data.get('testAmount', '10'))
        test_inv = f"{int(time.time() * 1000):013d}99"
        ha = hashlib.sha512(test_amount.encode()).hexdigest()

        endpoint = pg.api_endpoint_uat if pg.environment == 'uat' else pg.api_endpoint_prod
        murl = pg.merchant_region_url

        payload = {
            't': pg.tid,
            'o': test_inv,
            'ta': test_amount,
            'c': 'INR',
            'mac': pg.mac_token,
            'murl': murl,
            'name': 'Prajnadhara Admin Test',
            'phone': '9876543210',
            'emailId': request.user.email or 'admin@prajnadhara.edu',
            'ha': ha
        }

        post_data = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(
            endpoint,
            data=post_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        try:
            with urllib.request.urlopen(req, timeout=6) as response:
                headers = dict(response.headers)
                body = response.read().decode('utf-8', errors='ignore')
                loc = headers.get('Location') or headers.get('location')
                return Response({
                    'success': True,
                    'status': 'CONNECTED',
                    'statusCode': response.status,
                    'locationHeader': loc,
                    'headers': headers,
                    'message': 'Successfully connected to ToucanPay gateway server!'
                })
        except urllib.error.HTTPError as e:
            headers = dict(e.headers)
            loc = headers.get('Location') or headers.get('location')
            return Response({
                'success': True if e.code in [302, 200] else False,
                'status': f'HTTP_{e.code}',
                'locationHeader': loc,
                'headers': headers,
                'message': f'ToucanPay responded with HTTP {e.code}: {e.reason}'
            })
        except Exception as ex:
            return Response({
                'success': False,
                'status': 'FIREWALL_BLOCKED_OR_PENDING',
                'whitelistedIp': pg.whitelisted_ip,
                'error': str(ex),
                'notice': f'Connection to {endpoint} timed out. Toucan Payments requires whitelisting your server IP ({pg.whitelisted_ip}). Please email Toucan support to confirm IP whitelisting.'
            }, status=status.HTTP_200_OK)

