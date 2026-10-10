import uuid
from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.courses.models import Course, Lecture

class Enrollment(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    is_active = models.BooleanField(default=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"


class LectureProgress(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lecture_progress')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='student_progress')
    completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'lecture')

    def __str__(self):
        return f"{self.user.username} - {self.lecture.title} ({self.completed})"


class UserNote(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_notes')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='notes')
    timestamp_seconds = models.IntegerField(default=0)
    text = models.TextField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note: {self.lecture.title} ({self.timestamp_seconds}s)"


class Certificate(TimeStampedModel):
    certificate_number = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    grade = models.CharField(max_length=10, default='Distinction (A+)')
    total_hours = models.FloatField(default=12.0)
    secure_hash = models.CharField(max_length=64, default='')

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = f"CRT-PRAJNA-{uuid.uuid4().hex[:8].upper()}"
        if not self.secure_hash:
            self.secure_hash = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.certificate_number} - {self.user.username}"
