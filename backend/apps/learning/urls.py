from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyEnrollmentsListView, CourseProgressDetailView, ToggleLectureProgressView,
    UserNoteViewSet, CertificateViewSet, ClaimCertificateView
)

router = DefaultRouter()
router.register(r'learning/notes', UserNoteViewSet, basename='notes')
router.register(r'learning/certificates', CertificateViewSet, basename='certificates')

urlpatterns = [
    path('learning/my-courses/', MyEnrollmentsListView.as_view(), name='my-courses'),
    path('learning/progress/<int:course_id>/', CourseProgressDetailView.as_view(), name='course-progress'),
    path('learning/lectures/<int:lecture_id>/toggle/', ToggleLectureProgressView.as_view(), name='toggle-lecture'),
    path('learning/certificates/claim/', ClaimCertificateView.as_view(), name='claim-certificate'),
    path('learning/certificates/verify/<str:cert_number>/', CertificateViewSet.as_view({'get': 'verify'}), name='verify-certificate'),
    path('', include(router.urls)),
]
