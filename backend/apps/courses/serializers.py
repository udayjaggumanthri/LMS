from rest_framework import serializers
from apps.users.serializers import UserSerializer
from .models import Category, Course, Section, Lecture, LectureResource, Quiz, QuizQuestion

class CategorySerializer(serializers.ModelSerializer):
    courseCount = serializers.IntegerField(source='course_count', read_only=True)
    iconName = serializers.CharField(source='icon_name', required=False, default='Code')
    semester = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'semester', 'subcategories', 'iconName', 'courseCount', 'order']


class LectureResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureResource
        fields = ['id', 'name', 'size', 'url']


class LectureSerializer(serializers.ModelSerializer):
    durationMinutes = serializers.IntegerField(source='duration_minutes')
    previewFree = serializers.BooleanField(source='preview_free', required=False)
    videoUrl = serializers.CharField(source='video_url', required=False, allow_blank=True)
    resources = LectureResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Lecture
        fields = ['id', 'title', 'durationMinutes', 'type', 'previewFree', 'videoUrl', 'content', 'resources', 'order']


class SectionSerializer(serializers.ModelSerializer):
    lectures = LectureSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'lectures']


class CourseListSerializer(serializers.ModelSerializer):
    categoryId = serializers.CharField(source='category_id')
    instructorId = serializers.CharField(source='instructor_id')
    instructor = UserSerializer(read_only=True)
    originalPrice = serializers.FloatField(source='original_price')
    isFree = serializers.BooleanField(source='is_free')
    reviewsCount = serializers.IntegerField(source='reviews_count')
    studentCount = serializers.IntegerField(source='student_count')
    durationHours = serializers.FloatField(source='duration_hours')
    durationWeeks = serializers.IntegerField(source='duration_weeks', required=False)
    lectureCount = serializers.IntegerField(source='lecture_count')
    lastUpdated = serializers.DateTimeField(source='updated_at', format='%Y-%m-%d', read_only=True)
    whatYouWillLearn = serializers.ListField(source='what_you_will_learn')

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'slug', 'categoryId', 'subcategory',
            'instructorId', 'instructor', 'price', 'originalPrice', 'isFree',
            'rating', 'reviewsCount', 'studentCount', 'durationHours', 'durationWeeks',
            'lectureCount', 'level', 'language', 'lastUpdated', 'badges', 'thumbnail',
            'whatYouWillLearn', 'requirements', 'tags', 'settings', 'status', 'featured'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    categoryId = serializers.CharField(source='category_id')
    categoryName = serializers.CharField(source='category.name', read_only=True)
    instructorId = serializers.CharField(source='instructor_id')
    instructor = UserSerializer(read_only=True)
    originalPrice = serializers.FloatField(source='original_price')
    isFree = serializers.BooleanField(source='is_free')
    reviewsCount = serializers.IntegerField(source='reviews_count')
    studentCount = serializers.IntegerField(source='student_count')
    durationHours = serializers.FloatField(source='duration_hours')
    durationWeeks = serializers.IntegerField(source='duration_weeks', required=False)
    lectureCount = serializers.IntegerField(source='lecture_count')
    previewVideoUrl = serializers.CharField(source='preview_video_url')
    whatYouWillLearn = serializers.ListField(source='what_you_will_learn')
    targetAudience = serializers.ListField(source='target_audience')
    lastUpdated = serializers.DateTimeField(source='updated_at', format='%Y-%m-%d', read_only=True)
    curriculum = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'slug', 'categoryId', 'categoryName',
            'subcategory', 'instructorId', 'instructor', 'price', 'originalPrice',
            'isFree', 'rating', 'reviewsCount', 'studentCount', 'durationHours',
            'durationWeeks', 'lectureCount', 'level', 'language', 'lastUpdated',
            'badges', 'thumbnail', 'previewVideoUrl', 'whatYouWillLearn', 'requirements',
            'targetAudience', 'description', 'curriculum', 'tags', 'settings', 'status',
            'featured', 'review_feedback'
        ]


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False)
    curriculum = serializers.ListField(child=serializers.DictField(), required=False, write_only=True)
    categoryId = serializers.IntegerField(source='category_id', required=False, write_only=True)

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['id', 'instructor', 'rating', 'reviews_count', 'student_count', 'created_at', 'updated_at']

    def create(self, validated_data):
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data.get('title', 'course'))
            slug = base_slug or 'course'
            counter = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug

        curriculum_data = validated_data.pop('curriculum', None)
        course = super().create(validated_data)
        if curriculum_data:
            self._save_curriculum(course, curriculum_data)
        return course

    def update(self, instance, validated_data):
        curriculum_data = validated_data.pop('curriculum', None)
        course = super().update(instance, validated_data)
        if curriculum_data is not None:
            self._save_curriculum(course, curriculum_data)
        return course

    def _save_curriculum(self, course, curriculum_data):
        # Clear existing sections and recreate from builder payload
        course.curriculum.all().delete()
        total_lectures = 0
        total_minutes = 0

        for sec_idx, sec_data in enumerate(curriculum_data):
            sec_title = sec_data.get('title', f'Section {sec_idx + 1}')
            section = Section.objects.create(
                course=course,
                title=sec_title,
                order=sec_idx
            )
            lectures_data = sec_data.get('lectures', [])
            for lec_idx, lec_data in enumerate(lectures_data):
                dur = lec_data.get('durationMinutes', 10)
                total_minutes += dur
                total_lectures += 1
                Lecture.objects.create(
                    section=section,
                    title=lec_data.get('title', f'Lecture {lec_idx + 1}'),
                    duration_minutes=dur,
                    type=lec_data.get('type', 'video'),
                    preview_free=lec_data.get('previewFree', False),
                    video_url=lec_data.get('videoUrl', ''),
                    content=lec_data.get('content', ''),
                    order=lec_idx
                )

        course.lecture_count = total_lectures
        if total_minutes > 0:
            course.duration_hours = round(total_minutes / 60, 1)
        course.save()


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'options', 'correct_option_index', 'explanation', 'order']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'passing_score_percent', 'time_limit_minutes', 'questions']
