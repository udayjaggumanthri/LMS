from django.urls import path
from .views import (
    CourseReviewsListView, InstructorReplyReviewView,
    CourseQAListView, QAAnswerCreateView
)

urlpatterns = [
    path('courses/<int:course_id>/reviews/', CourseReviewsListView.as_view(), name='course-reviews'),
    path('instructor/reviews/<int:review_id>/reply/', InstructorReplyReviewView.as_view(), name='reply-review'),
    path('courses/<int:course_id>/qa/', CourseQAListView.as_view(), name='course-qa'),
    path('qa/<int:question_id>/answers/', QAAnswerCreateView.as_view(), name='answer-qa'),
]
