from rest_framework import serializers
from apps.courses.serializers import CourseListSerializer
from .models import Enrollment, LectureProgress, UserNote, Certificate

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    completedLecturesCount = serializers.SerializerMethodField()
    totalLecturesCount = serializers.SerializerMethodField()
    progressPercent = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            'id', 'course', 'is_active', 'created_at', 'completed_at',
            'completedLecturesCount', 'totalLecturesCount', 'progressPercent'
        ]

    def get_completedLecturesCount(self, obj):
        return LectureProgress.objects.filter(
            user=obj.user,
            lecture__section__course=obj.course,
            completed=True
        ).count()

    def get_totalLecturesCount(self, obj):
        return obj.course.lecture_count or 1

    def get_progressPercent(self, obj):
        total = self.get_totalLecturesCount(obj)
        completed = self.get_completedLecturesCount(obj)
        if total == 0:
            return 0
        return min(100, int((completed / total) * 100))


class UserNoteSerializer(serializers.ModelSerializer):
    lectureTitle = serializers.CharField(source='lecture.title', read_only=True)
    timestampSeconds = serializers.IntegerField(source='timestamp_seconds')

    class Meta:
        model = UserNote
        fields = ['id', 'course', 'lecture', 'lectureTitle', 'timestampSeconds', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']


class CertificateSerializer(serializers.ModelSerializer):
    courseTitle = serializers.CharField(source='course.title', read_only=True)
    userName = serializers.SerializerMethodField()
    instructorName = serializers.SerializerMethodField()
    issueDate = serializers.DateTimeField(source='created_at', format='%B %d, %Y', read_only=True)
    certificateNumber = serializers.CharField(source='certificate_number', read_only=True)
    totalHours = serializers.FloatField(source='total_hours', read_only=True)
    verifyUrl = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificateNumber', 'courseId', 'courseTitle',
            'userName', 'instructorName', 'issueDate', 'grade',
            'totalHours', 'verifyUrl', 'secure_hash'
        ]

    courseId = serializers.CharField(source='course.id', read_only=True)

    def get_userName(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username

    def get_instructorName(self, obj):
        inst = obj.course.instructor
        full = f"{inst.first_name} {inst.last_name}".strip()
        return full if full else inst.username

    def get_verifyUrl(self, obj):
        return f"http://localhost:3000/certificates/verify/{obj.certificate_number}"
