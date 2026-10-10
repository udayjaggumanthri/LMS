from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, CourseViewSet, InstructorCourseViewSet, AdminCourseReviewQueueViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'instructor/courses', InstructorCourseViewSet, basename='instructor-courses')
router.register(r'admin/review-queue', AdminCourseReviewQueueViewSet, basename='admin-review-queue')

urlpatterns = [
    path('', include(router.urls)),
]
