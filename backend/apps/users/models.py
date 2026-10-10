from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.core.models import TimeStampedModel

class UserRole(models.TextChoices):
    STUDENT = 'student', 'Student'
    INSTRUCTOR = 'instructor', 'Instructor'
    ADMIN = 'admin', 'Admin'

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT)
    avatar = models.URLField(max_length=500, blank=True, default='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200')
    title = models.CharField(max_length=200, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    payout_method = models.JSONField(default=dict, blank=True)
    is_approved_instructor = models.BooleanField(default=False)
    rating = models.FloatField(default=5.0)
    reviews_count = models.IntegerField(default=0)
    students_count = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.role})"


class InstructorApplication(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='instructor_applications')
    applicant_name = models.CharField(max_length=200)
    email = models.EmailField()
    expertise = models.CharField(max_length=255)
    experience_bio = models.TextField()
    sample_topic = models.CharField(max_length=255)
    linkedin_or_portfolio = models.URLField(max_length=500, blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    admin_feedback = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Application: {self.applicant_name} ({self.status})"
