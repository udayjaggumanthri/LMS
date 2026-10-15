from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.core.permissions import IsAdminUser
from .models import User, InstructorApplication
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    AdminUserCreateSerializer,
    InstructorApplicationSerializer,
    CustomTokenObtainPairSerializer,
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Trigger automated welcome email
        try:
            from apps.core.email_service import EmailService
            EmailService.send_welcome_email(user)
        except Exception:
            pass

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        return self.patch(request)

    def patch(self, request):
        data = request.data.copy()
        name = data.get('name')
        if name:
            parts = str(name).strip().split(' ', 1)
            data['first_name'] = parts[0]
            data['last_name'] = parts[1] if len(parts) > 1 else ''
        new_password = data.get('password') or data.get('newPassword')
        current_password = data.get('currentPassword') or data.get('current_password')
        serializer = UserSerializer(request.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if new_password:
            if not current_password or not user.check_password(current_password):
                return Response({'currentPassword': ['Current password is incorrect.']}, status=status.HTTP_400_BAD_REQUEST)
            if len(str(new_password)) < 8:
                return Response({'password': ['Password must be at least 8 characters.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save(update_fields=['password'])
        return Response(UserSerializer(user).data)


class InstructorApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = InstructorApplicationSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return InstructorApplication.objects.all()
        return InstructorApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        application = serializer.save()
        if application.status == 'approved':
            application.user.role = 'instructor'
            application.user.is_approved_instructor = True
            application.user.save(update_fields=['role', 'is_approved_instructor'])


class AdminUsersViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        user = serializer.save()
        if user.role == 'instructor' and not user.is_approved_instructor:
            user.is_approved_instructor = True
            user.save(update_fields=['is_approved_instructor'])

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'Cannot delete your own active administrator account'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode
        from apps.core.email_service import EmailService

        email = str(request.data.get('email') or '').strip()
        user = User.objects.filter(email__iexact=email).first() if email else None
        if user and user.email:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            reset_url = f'https://uat.prajnadharaedu.com/reset-password?uid={uid}&token={token}'
            try:
                EmailService.send_password_reset(user, reset_url)
            except Exception:
                pass
        return Response({
            'success': True,
            'message': 'If an account exists for that email, a reset link is on the way.',
        })


class ResetPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode

        password = str(request.data.get('password') or '')
        if len(password) < 8:
            return Response({'password': ['Password must be at least 8 characters.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_id = force_str(urlsafe_base64_decode(request.data.get('uid') or ''))
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({'error': 'This reset link is not valid.'}, status=status.HTTP_400_BAD_REQUEST)
        if not PasswordResetTokenGenerator().check_token(user, request.data.get('token') or ''):
            return Response({'error': 'This reset link has expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'success': True, 'message': 'Your password has been updated.'})
