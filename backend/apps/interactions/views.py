from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from apps.core.permissions import IsInstructor
from apps.courses.models import Course
from .models import Review, QAQuestion, QAAnswer
from .serializers import ReviewSerializer, QAQuestionSerializer, QAAnswerSerializer

class CourseReviewsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, course_id):
        reviews = Review.objects.filter(course_id=course_id).select_related('user')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, course_id):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        rating = int(request.data.get('rating', 5))
        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'error': 'Comment cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(
            course=course,
            user=request.user,
            rating=rating,
            comment=comment
        )
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class InstructorReplyReviewView(APIView):
    permission_classes = [IsInstructor]

    def post(self, request, review_id):
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)

        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'error': 'Reply cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        review.instructor_reply_comment = comment
        review.instructor_reply_date = timezone.now().date()
        review.save(update_fields=['instructor_reply_comment', 'instructor_reply_date'])
        return Response(ReviewSerializer(review).data)


class CourseQAListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, course_id):
        questions = QAQuestion.objects.filter(course_id=course_id).select_related('user').prefetch_related('answers', 'answers__user')
        serializer = QAQuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        title = request.data.get('title', '').strip()
        content = request.data.get('content', '').strip()
        if not title or not content:
            return Response({'error': 'Title and content are required'}, status=status.HTTP_400_BAD_REQUEST)

        q = QAQuestion.objects.create(
            course=course,
            user=request.user,
            title=title,
            content=content
        )
        return Response(QAQuestionSerializer(q).data, status=status.HTTP_201_CREATED)


class QAAnswerCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, question_id):
        try:
            question = QAQuestion.objects.get(id=question_id)
        except QAQuestion.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Answer content cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        is_inst = (request.user.role in ['instructor', 'admin'])
        ans = QAAnswer.objects.create(
            question=question,
            user=request.user,
            content=content,
            is_instructor=is_inst
        )
        return Response(QAAnswerSerializer(ans).data, status=status.HTTP_201_CREATED)
