from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class Category(TimeStampedModel):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default='')
    semester = models.CharField(max_length=50, blank=True, default='')
    subcategories = models.JSONField(default=list, blank=True)
    icon_name = models.CharField(max_length=50, default='Code')
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    @property
    def course_count(self):
        return self.courses.filter(status='published').count()


class CourseLevel(models.TextChoices):
    BEGINNER = 'Beginner', 'Beginner'
    INTERMEDIATE = 'Intermediate', 'Intermediate'
    EXPERT = 'Expert', 'Expert'
    ADVANCED = 'Advanced', 'Advanced'
    EXECUTIVE = 'Executive', 'Executive'
    ALL_LEVELS = 'All Levels', 'All Levels'


class CourseStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    IN_REVIEW = 'in_review', 'In Review'
    PUBLISHED = 'published', 'Published'
    CHANGES_REQUESTED = 'changes_requested', 'Changes Requested'


class Course(TimeStampedModel):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=300, blank=True, default='')
    slug = models.SlugField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses')
    subcategory = models.CharField(max_length=150, blank=True, default='')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_teaching')
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=False)
    
    level = models.CharField(max_length=30, choices=CourseLevel.choices, default=CourseLevel.ALL_LEVELS)
    language = models.CharField(max_length=50, default='English')
    badges = models.JSONField(default=list, blank=True)
    
    thumbnail = models.URLField(max_length=500, default='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800')
    preview_video_url = models.URLField(max_length=500, blank=True, default='')
    
    what_you_will_learn = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    target_audience = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, default='')
    
    status = models.CharField(max_length=30, choices=CourseStatus.choices, default=CourseStatus.PUBLISHED)
    featured = models.BooleanField(default=False)
    review_feedback = models.TextField(blank=True, default='')
    
    # Aggregated metrics cached for high-performance reading
    rating = models.FloatField(default=5.0)
    reviews_count = models.IntegerField(default=0)
    student_count = models.IntegerField(default=0)
    duration_hours = models.FloatField(default=0.0)
    duration_weeks = models.IntegerField(default=10)
    lecture_count = models.IntegerField(default=0)
    tags = models.JSONField(default=list, blank=True)
    settings = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-featured', '-created_at']

    def __str__(self):
        return self.title


class Section(TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='curriculum')
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class LectureType(models.TextChoices):
    VIDEO = 'video', 'Video'
    ARTICLE = 'article', 'Article'
    QUIZ = 'quiz', 'Quiz'
    RESOURCE = 'resource', 'Resource'


class Lecture(TimeStampedModel):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=255)
    duration_minutes = models.IntegerField(default=10)
    type = models.CharField(max_length=20, choices=LectureType.choices, default=LectureType.VIDEO)
    preview_free = models.BooleanField(default=False)
    video_url = models.URLField(max_length=500, blank=True, default='')
    content = models.TextField(blank=True, default='')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.section.title} - {self.title}"


class LectureResource(TimeStampedModel):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='resources')
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=50, default='1.2 MB')
    url = models.URLField(max_length=500)

    def __str__(self):
        return self.name


class Quiz(TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    title = models.CharField(max_length=255)
    passing_score_percent = models.IntegerField(default=80)
    time_limit_minutes = models.IntegerField(default=30)

    class Meta:
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return self.title


class QuizQuestion(TimeStampedModel):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    options = models.JSONField(default=list)  # list of strings
    correct_option_index = models.IntegerField(default=0)
    explanation = models.TextField(blank=True, default='')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q: {self.question[:50]}"
