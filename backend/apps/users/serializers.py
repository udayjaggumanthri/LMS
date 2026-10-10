from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, InstructorApplication

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    isApprovedInstructor = serializers.BooleanField(source='is_approved_instructor', read_only=True)
    joinedAt = serializers.DateTimeField(source='date_joined', format='%Y-%m-%d', read_only=True)
    enrolledCourseIds = serializers.SerializerMethodField()
    wishlistCourseIds = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'name', 'first_name', 'last_name',
            'role', 'avatar', 'title', 'bio', 'payout_method',
            'isApprovedInstructor', 'rating', 'reviews_count',
            'students_count', 'total_earnings', 'joinedAt', 'enrolledCourseIds', 'wishlistCourseIds'
        ]
        read_only_fields = [
            'id', 'joinedAt', 'rating', 'reviews_count', 'students_count',
            'total_earnings', 'enrolledCourseIds', 'wishlistCourseIds'
        ]

    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full if full else obj.username

    def get_enrolledCourseIds(self, obj):
        if hasattr(obj, 'enrollments'):
            return [str(cid) for cid in obj.enrollments.filter(is_active=True).values_list('course_id', flat=True)]
        return []

    def get_wishlistCourseIds(self, obj):
        return []


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username') or attrs.get('email', '')
        password = attrs.get('password')

        # Allow user to log in with either email or username
        if '@' in username_or_email:
            try:
                user_match = User.objects.filter(email__iexact=username_or_email.strip()).first()
                if user_match:
                    attrs['username'] = user_match.username
            except Exception:
                pass

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'name']

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        password = validated_data.pop('password')
        role = validated_data.get('role', 'student')
        
        first_name = name
        last_name = ''
        if ' ' in name:
            parts = name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1]

        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_approved_instructor=(role == 'instructor')
        )
        user.set_password(password)
        user.save()
        return user


class InstructorApplicationSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = InstructorApplication
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
