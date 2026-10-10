from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from apps.courses.models import Course, Lecture
from .models import Enrollment, LectureProgress, UserNote, Certificate
from .serializers import EnrollmentSerializer, UserNoteSerializer, CertificateSerializer

class MyEnrollmentsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user, is_active=True).select_related('course', 'course__instructor')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class CourseProgressDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        completed_lecture_ids = list(
            LectureProgress.objects.filter(
                user=request.user,
                lecture__section__course=course,
                completed=True
            ).values_list('lecture_id', flat=True)
        )

        total_lectures = course.lecture_count or 1
        percent = min(100, int((len(completed_lecture_ids) / total_lectures) * 100))

        return Response({
            'courseId': course.id,
            'completedLectureIds': completed_lecture_ids,
            'totalLectures': total_lectures,
            'progressPercent': percent,
        })


class ToggleLectureProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lecture_id):
        try:
            lecture = Lecture.objects.get(id=lecture_id)
        except Lecture.DoesNotExist:
            return Response({'error': 'Lecture not found'}, status=status.HTTP_404_NOT_FOUND)

        progress, created = LectureProgress.objects.get_or_create(user=request.user, lecture=lecture)
        if not created:
            progress.completed = not progress.completed
            progress.save()
        else:
            progress.completed = True
            progress.save()

        # Check if course is 100% complete; if so, issue certificate!
        course = lecture.section.course
        all_lecture_ids = Lecture.objects.filter(section__course=course).values_list('id', flat=True)
        completed_count = LectureProgress.objects.filter(
            user=request.user,
            lecture_id__in=all_lecture_ids,
            completed=True
        ).count()

        certificate_data = None
        if completed_count >= len(all_lecture_ids) and len(all_lecture_ids) > 0:
            cert, cert_created = Certificate.objects.get_or_create(
                user=request.user,
                course=course,
                defaults={'total_hours': course.duration_hours or 10.0}
            )
            enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
            if enrollment and not enrollment.completed_at:
                enrollment.completed_at = timezone.now()
                enrollment.save(update_fields=['completed_at'])
            certificate_data = CertificateSerializer(cert).data

        return Response({
            'lectureId': lecture.id,
            'completed': progress.completed,
            'certificateAwarded': certificate_data
        })


class UserNoteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserNoteSerializer

    def get_queryset(self):
        qs = UserNote.objects.filter(user=self.request.user)
        course_id = self.request.query_params.get('courseId')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'verify']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Certificate.objects.filter(user=self.request.user)
        return Certificate.objects.all()

    def verify(self, request, cert_number=None):
        try:
            cert = Certificate.objects.get(certificate_number=cert_number)
            return Response(CertificateSerializer(cert).data)
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found on immutable verification ledger.'}, status=status.HTTP_404_NOT_FOUND)
