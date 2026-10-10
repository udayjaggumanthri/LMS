from rest_framework import serializers
from .models import Review, QAQuestion, QAAnswer

class ReviewSerializer(serializers.ModelSerializer):
    courseId = serializers.CharField(source='course_id')
    userId = serializers.CharField(source='user_id')
    userName = serializers.SerializerMethodField()
    userAvatar = serializers.CharField(source='user.avatar', read_only=True)
    helpfulCount = serializers.IntegerField(source='helpful_count', read_only=True)
    date = serializers.DateTimeField(source='created_at', format='%B %d, %Y', read_only=True)
    instructorReply = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'courseId', 'userId', 'userName', 'userAvatar', 'rating', 'date', 'comment', 'helpfulCount', 'instructorReply']
        read_only_fields = ['id', 'userId', 'userName', 'userAvatar', 'date', 'helpfulCount']

    def get_userName(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username

    def get_instructorReply(self, obj):
        if obj.instructor_reply_comment:
            return {
                'comment': obj.instructor_reply_comment,
                'date': obj.instructor_reply_date.strftime('%B %d, %Y') if obj.instructor_reply_date else ''
            }
        return None


class QAAnswerSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id', read_only=True)
    userName = serializers.SerializerMethodField()
    userAvatar = serializers.CharField(source='user.avatar', read_only=True)
    isInstructor = serializers.BooleanField(source='is_instructor', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', format='%b %d, %Y', read_only=True)

    class Meta:
        model = QAAnswer
        fields = ['id', 'userId', 'userName', 'userAvatar', 'content', 'isInstructor', 'createdAt']

    def get_userName(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username


class QAQuestionSerializer(serializers.ModelSerializer):
    courseId = serializers.CharField(source='course_id')
    userId = serializers.CharField(source='user_id', read_only=True)
    userName = serializers.SerializerMethodField()
    userAvatar = serializers.CharField(source='user.avatar', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', format='%b %d, %Y', read_only=True)
    answers = QAAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QAQuestion
        fields = ['id', 'courseId', 'lecture', 'userId', 'userName', 'userAvatar', 'title', 'content', 'createdAt', 'answers']
        read_only_fields = ['id', 'userId', 'userName', 'userAvatar', 'createdAt', 'answers']

    def get_userName(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full if full else obj.user.username
