from django.urls import path
from .views import MediaUploadView, MediaDeleteView

urlpatterns = [
    path('media/upload/', MediaUploadView.as_view(), name='media-upload'),
    path('media/', MediaUploadView.as_view(), name='media-list'),
    path('media/<int:pk>/', MediaDeleteView.as_view(), name='media-delete'),
]
