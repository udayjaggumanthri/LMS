from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.permissions import IsAdminUser
from .models import Page, PageSection
from .serializers import PageSerializer, PageSectionSerializer

class PublicPageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            page = Page.objects.prefetch_related('sections').get(slug=slug, is_published=True)
            return Response(PageSerializer(page).data)
        except Page.DoesNotExist:
            return Response({'error': f'Page with slug "{slug}" not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminCMSPagesViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Page.objects.prefetch_related('sections').all()
    serializer_class = PageSerializer
    lookup_field = 'slug'


class AdminCMSSectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = PageSection.objects.all()
    serializer_class = PageSectionSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
