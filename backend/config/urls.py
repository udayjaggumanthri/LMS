from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'Prajnadhara EDU Enterprise API',
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
    path('api/', include('apps.learning.urls')),
    path('api/', include('apps.interactions.urls')),
    path('api/', include('apps.cms.urls')),
    path('api/', include('apps.admin_governance.urls')),
    path('api/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
