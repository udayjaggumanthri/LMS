from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel
from apps.courses.models import Course, Lecture

class Review(TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_reviews')
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    helpful_count = models.IntegerField(default=0)
    instructor_reply_comment = models.TextField(blank=True, default='')
    instructor_reply_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.rating}*)"


class QAQuestion(TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='qa_questions')
    lecture = models.ForeignKey(Lecture, on_delete=models.SET_NULL, null=True, blank=True, related_name='qa_questions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='qa_questions')
    title = models.CharField(max_length=255)
    content = models.TextField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.course.title})"


class QAAnswer(TimeStampedModel):
    question = models.ForeignKey(QAQuestion, on_delete=models.CASCADE, related_name='answers')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='qa_answers')
    content = models.TextField()
    is_instructor = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Ans by {self.user.username} on {self.question.title[:30]}"
