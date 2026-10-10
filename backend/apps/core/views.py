import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import MediaFile

class MediaUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        if file_obj.size > 25 * 1024 * 1024:
            return Response({'error': 'File exceeds maximum limit of 25MB'}, status=status.HTTP_400_BAD_REQUEST)

        media_instance = MediaFile.objects.create(
            name=file_obj.name,
            file=file_obj,
            file_type=file_obj.content_type or '',
            file_size=file_obj.size,
            uploaded_by=request.user
        )

        try:
            file_url = request.build_absolute_uri(media_instance.file.url)
        except Exception:
            file_url = media_instance.file.url

        return Response({
            'id': media_instance.id,
            'name': media_instance.name,
            'url': file_url,
            'relativeUrl': media_instance.file.url,
            'fileType': media_instance.file_type,
            'fileSize': media_instance.file_size,
            'createdAt': media_instance.created_at.strftime('%Y-%m-%d %H:%M')
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        media_files = MediaFile.objects.all()[:60]
        results = []
        for m in media_files:
            try:
                url = request.build_absolute_uri(m.file.url)
            except Exception:
                url = m.file.url if m.file else ''
            results.append({
                'id': m.id,
                'name': m.name,
                'url': url,
                'relativeUrl': m.file.url if m.file else '',
                'fileType': m.file_type,
                'fileSize': m.file_size,
                'createdAt': m.created_at.strftime('%Y-%m-%d %H:%M')
            })
        return Response(results)


class MediaDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            m = MediaFile.objects.get(pk=pk)
            if m.file and os.path.isfile(m.file.path):
                try:
                    os.remove(m.file.path)
                except OSError:
                    pass
            m.delete()
            return Response({'success': True, 'message': 'Media deleted successfully'})
        except MediaFile.DoesNotExist:
            return Response({'error': 'Media not found'}, status=status.HTTP_404_NOT_FOUND)
