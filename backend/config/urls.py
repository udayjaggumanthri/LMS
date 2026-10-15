from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'PrajnadharaEdu Enterprise API',
        'version': '1.0.0',
        'database': settings.DATABASES['default']['ENGINE'].split('.')[-1]
    })

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    
    # Modular LMS API endpoints
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.courses.urls')),
    path('api/', include('apps.cart.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/v1/', include('apps.payment_hub.urls')),
    path('api/', include('apps.learning.urls')),
    path('api/', include('apps.interactions.urls')),
    path('api/', include('apps.cms.urls')),
    path('api/', include('apps.admin_governance.urls')),
    path('api/', include('apps.core.urls')),
]

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]
