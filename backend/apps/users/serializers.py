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
            'id', 'avatar', 'joinedAt', 'rating', 'reviews_count', 'students_count',
            'total_earnings', 'enrolledCourseIds', 'wishlistCourseIds'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = ''
        return data

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

    def validate_email(self, value):
        email = (value or '').strip()
        if not email:
            raise serializers.ValidationError('Email is required.')
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_role(self, value):
        if value not in ('student', 'instructor'):
            raise serializers.ValidationError('Choose student or instructor.')
        return value

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

        username = validated_data['username']
        base = username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f'{base}{suffix}'
            suffix += 1

        user = User(
            username=username,
            email=validated_data.get('email', ''),
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_approved_instructor=False,
            is_staff=False,
            is_superuser=False,
        )
        user.set_password(password)
        user.save()
        return user


class AdminUserCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    role = serializers.ChoiceField(choices=['student', 'instructor', 'admin'])

    def validate_email(self, value):
        email = value.strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def create(self, validated_data):
        name = validated_data['name'].strip()
        first_name = name
        last_name = ''
        if ' ' in name:
            first_name, last_name = name.split(' ', 1)
        local = validated_data['email'].split('@')[0]
        username = ''.join(ch for ch in local if ch.isalnum() or ch in '._-') or 'user'
        base = username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f'{base}{suffix}'
            suffix += 1
        role = validated_data['role']
        user = User(
            username=username,
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_staff=role == 'admin',
            is_superuser=role == 'admin',
            is_approved_instructor=role == 'instructor',
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class InstructorApplicationSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = InstructorApplication
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
