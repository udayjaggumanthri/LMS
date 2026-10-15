from django.db.models import Q
from django.http import JsonResponse
from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import IsAdminUser, IsInstructor
from .models import Category, Course, CourseAnnouncement, Section, Lecture, Quiz
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
        qs = Course.objects.filter(status='published').select_related('instructor', 'category').prefetch_related('instructors')
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
            admin_qs = Course.objects.all().select_related('instructor', 'category').prefetch_related('instructors')
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
        qs = Course.objects.select_related('instructor', 'category').prefetch_related('instructors')
        if self.request.user.role == 'admin':
            return qs
        return qs.filter(Q(instructor=self.request.user) | Q(instructors=self.request.user)).distinct()

    def _load_course(self, pk):
        return Course.objects.select_related('instructor', 'category').prefetch_related('instructors').get(pk=pk)

    def _sync_team(self, course):
        if getattr(self.request.user, 'role', '') != 'admin':
            if course.instructor_id and not course.instructors.filter(pk=course.instructor_id).exists():
                course.instructors.add(course.instructor_id)
            return course
        if 'instructorIds' not in self.request.data and 'instructor_ids' not in self.request.data:
            if course.instructor_id and not course.instructors.filter(pk=course.instructor_id).exists():
                course.instructors.add(course.instructor_id)
            return course
        raw = self.request.data.get('instructorIds', self.request.data.get('instructor_ids'))
        if isinstance(raw, str):
            raw = [part.strip() for part in raw.split(',') if part.strip()]
        ids = []
        for item in raw or []:
            try:
                ids.append(int(item))
            except (TypeError, ValueError):
                continue
        from apps.users.models import User
        people = {
            user.id: user
            for user in User.objects.filter(id__in=ids, role__in=['instructor', 'admin'])
        }
        ordered = [people[item] for item in ids if item in people]
        if not ordered:
            ordered = [self.request.user]
        course.instructor = ordered[0]
        course.save(update_fields=['instructor', 'updated_at'])
        course.instructors.set(ordered)
        return course

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return CourseDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        course = self._load_course(serializer.instance.pk)
        return Response(CourseDetailSerializer(course).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        course = self._load_course(serializer.instance.pk)
        return Response(CourseDetailSerializer(course).data)

    def perform_create(self, serializer):
        status_val = self.request.data.get('status') or ('published' if self.request.user.role == 'admin' else 'in_review')
        instructor = self.request.user
        instructor_id = self.request.data.get('instructorId')
        if self.request.user.role == 'admin' and instructor_id and str(instructor_id).isdigit():
            try:
                from apps.users.models import User
                instructor = User.objects.get(id=int(instructor_id))
            except Exception:
                pass
        course = serializer.save(instructor=instructor, status=status_val)
        self._sync_team(course)

    def perform_update(self, serializer):
        course = serializer.save()
        self._sync_team(course)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        course = self.get_object()
        course.status = 'published'
        course.save()
        course = self._load_course(course.pk)
        return Response(CourseDetailSerializer(course).data)


class AdminCourseReviewQueueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = CourseDetailSerializer

    def get_queryset(self):
        return Course.objects.filter(status__in=['in_review', 'changes_requested']).select_related('instructor', 'category').prefetch_related('instructors')

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


def _can_post_announcement(user, course):
    if not user.is_authenticated:
        return False
    if getattr(user, 'role', '') == 'admin':
        return True
    if course.instructor_id == user.id:
        return True
    return course.instructors.filter(pk=user.id).exists()


def _announcement_payload(row):
    author = row.author
    name = ''
    if author is not None:
        name = f'{author.first_name} {author.last_name}'.strip() or author.username
    return {
        'id': row.id,
        'courseId': row.course_id,
        'title': row.title,
        'body': row.body,
        'authorName': name,
        'createdAt': row.created_at.strftime('%b %d, %Y'),
    }


class CourseAnnouncementListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, course_id):
        rows = CourseAnnouncement.objects.filter(course_id=course_id).select_related('author')
        return Response([_announcement_payload(row) for row in rows])

    def post(self, request, course_id):
        course = Course.objects.filter(pk=course_id).first()
        if course is None:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not _can_post_announcement(request.user, course):
            return Response({'error': 'You cannot post announcements for this course.'}, status=status.HTTP_403_FORBIDDEN)
        title = str(request.data.get('title') or '').strip()
        body = str(request.data.get('body') or '').strip()
        if not title or not body:
            return Response({'error': 'Title and message are required.'}, status=status.HTTP_400_BAD_REQUEST)
        row = CourseAnnouncement.objects.create(course=course, author=request.user, title=title[:200], body=body)
        return Response(_announcement_payload(row), status=status.HTTP_201_CREATED)


class CourseAnnouncementDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, course_id, announcement_id):
        row = CourseAnnouncement.objects.filter(pk=announcement_id, course_id=course_id).select_related('course').first()
        if row is None:
            return Response({'error': 'Announcement not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not _can_post_announcement(request.user, row.course):
            return Response({'error': 'You cannot remove this announcement.'}, status=status.HTTP_403_FORBIDDEN)
        row.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseCatalogExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .transfer import export_catalog
        payload = export_catalog()
        response = JsonResponse(payload, json_dumps_params={'ensure_ascii': False})
        response['Content-Disposition'] = 'attachment; filename="prajnadhara-courses.json"'
        return response


class CourseCatalogImportView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        from .transfer import import_catalog
        uploaded = request.FILES.get('file')
        try:
            if uploaded is not None:
                raw = uploaded.read()
                if len(raw) > 20 * 1024 * 1024:
                    return Response({'error': 'The course file must be 20 MB or smaller.'}, status=status.HTTP_400_BAD_REQUEST)
                result = import_catalog(raw, request.user)
            else:
                result = import_catalog(request.data, request.user)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)
