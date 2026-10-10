from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    ProfileView,
    CustomTokenObtainPairView,
    InstructorApplicationViewSet,
    AdminUsersViewSet,
)

router = DefaultRouter()
router.register(r'instructor-applications', InstructorApplicationViewSet, basename='instructor-applications')
router.register(r'admin/users', AdminUsersViewSet, basename='admin-users')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/me/', ProfileView.as_view(), name='profile_me'),
    path('', include(router.urls)),
]
