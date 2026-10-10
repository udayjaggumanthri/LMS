from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import IsAdminUser, IsInstructor
from .models import Category, Course, Section, Lecture, Quiz
from .serializers import (
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseCreateUpdateSerializer, SectionSerializer, LectureSerializer, QuizSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.AllowAny()]


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subtitle', 'description', 'subcategory']
    ordering_fields = ['price', 'rating', 'created_at', 'student_count']

    def get_queryset(self):
        qs = Course.objects.filter(status='published').select_related('instructor', 'category')
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category__slug=cat)
        level = self.request.query_params.get('level')
        if level and level != 'All Levels':
            qs = qs.filter(level=level)
        price_filter = self.request.query_params.get('price')
        if price_filter == 'free':
            qs = qs.filter(is_free=True)
        elif price_filter == 'paid':
            qs = qs.filter(is_free=False)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer

    def get_object(self):
        lookup = self.kwargs.get(self.lookup_field)
        queryset = self.filter_queryset(self.get_queryset())
        obj = queryset.filter(slug=lookup).first()
        if not obj and str(lookup).isdigit():
            obj = queryset.filter(id=int(lookup)).first()
        if not obj and self.request.user.is_authenticated and getattr(self.request.user, 'role', '') in ['admin', 'instructor']:
            admin_qs = Course.objects.all().select_related('instructor', 'category')
            obj = admin_qs.filter(slug=lookup).first()
            if not obj and str(lookup).isdigit():
                obj = admin_qs.filter(id=int(lookup)).first()
        if not obj:
            from rest_framework.exceptions import NotFound
            raise NotFound("Course not found.")
        self.check_object_permissions(self.request, obj)
        return obj


class InstructorCourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsInstructor]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Course.objects.all()
        return Course.objects.filter(instructor=self.request.user)

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return CourseDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        status_val = self.request.data.get('status') or ('published' if self.request.user.role == 'admin' else 'in_review')
        instructor = self.request.user
        if self.request.user.role == 'admin' and self.request.data.get('instructorId'):
            try:
                from apps.users.models import User
                instructor = User.objects.get(id=self.request.data.get('instructorId'))
            except Exception:
                pass
        serializer.save(instructor=instructor, status=status_val)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.save()
        return Response({'message': f'Course {course.title} published successfully.', 'status': 'published'})


class AdminCourseReviewQueueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = CourseDetailSerializer

    def get_queryset(self):
        return Course.objects.filter(status__in=['in_review', 'changes_requested'])

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.save()
        return Response({'message': f'Course {course.title} published to live storefront.'})

    @action(detail=True, methods=['post'])
    def request_changes(self, request, pk=None):
        course = self.get_object()
        feedback = request.data.get('feedback', 'Revisions requested.')
        course.status = 'changes_requested'
        course.review_feedback = feedback
        course.save()
        return Response({'message': f'Revision feedback sent to instructor.'})
