from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicPageView, AdminCMSPagesViewSet, AdminCMSSectionViewSet

router = DefaultRouter()
router.register(r'admin/cms/pages', AdminCMSPagesViewSet, basename='admin-cms-pages')
router.register(r'admin/cms/sections', AdminCMSSectionViewSet, basename='admin-cms-sections')

urlpatterns = [
    path('cms/pages/<slug:slug>/', PublicPageView.as_view(), name='public-page'),
    path('', include(router.urls)),
]
