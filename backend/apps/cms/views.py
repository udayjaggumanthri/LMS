from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.permissions import IsAdminUser
from .models import Page, PageSection, BlogPost, BlogCategory
from .serializers import PageSerializer, PageSectionSerializer, BlogPostSerializer, BlogCategorySerializer

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


class PublicBlogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = BlogPost.objects.filter(is_published=True)
        cat = self.request.query_params.get('category')
        if cat and cat.lower() != 'all':
            qs = qs.filter(Q(category__iexact=cat) | Q(category_rel__slug__iexact=cat))
        query = self.request.query_params.get('q')
        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(excerpt__icontains=query) | Q(content__icontains=query))
        return qs

    def retrieve(self, request, *args, **kwargs):
        lookup_val = self.kwargs.get('slug')
        try:
            if lookup_val.isdigit():
                post = BlogPost.objects.get(id=int(lookup_val), is_published=True)
            else:
                post = BlogPost.objects.get(slug=lookup_val, is_published=True)
            BlogPost.objects.filter(id=post.id).update(views_count=post.views_count + 1)
            post.views_count += 1
            return Response(self.get_serializer(post).data)
        except BlogPost.DoesNotExist:
            return Response({'error': f'Blog post "{lookup_val}" not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminBlogPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostSerializer
