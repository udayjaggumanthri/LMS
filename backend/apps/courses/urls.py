from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, CourseViewSet, InstructorCourseViewSet, AdminCourseReviewQueueViewSet,
    CourseAnnouncementListView, CourseAnnouncementDetailView,
    CourseCatalogExportView, CourseCatalogImportView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'instructor/courses', InstructorCourseViewSet, basename='instructor-courses')
router.register(r'admin/review-queue', AdminCourseReviewQueueViewSet, basename='admin-review-queue')

urlpatterns = [
    path('admin/courses/export/', CourseCatalogExportView.as_view(), name='admin-course-export'),
    path('admin/courses/import/', CourseCatalogImportView.as_view(), name='admin-course-import'),
    path('courses/<int:course_id>/announcements/', CourseAnnouncementListView.as_view(), name='course-announcements'),
    path('courses/<int:course_id>/announcements/<int:announcement_id>/', CourseAnnouncementDetailView.as_view(), name='course-announcement'),
    path('', include(router.urls)),
]
