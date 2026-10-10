from rest_framework import serializers
from .models import Page, PageSection

class PageSectionSerializer(serializers.ModelSerializer):
    sectionKey = serializers.CharField(source='section_key')
    sectionName = serializers.CharField(source='section_name')
    badgeText = serializers.CharField(source='badge_text', allow_blank=True, required=False)
    mediaUrl = serializers.CharField(source='media_url', allow_blank=True, required=False)
    primaryBtnText = serializers.CharField(source='primary_btn_text', allow_blank=True, required=False)
    primaryBtnLink = serializers.CharField(source='primary_btn_link', allow_blank=True, required=False)
    secondaryBtnText = serializers.CharField(source='secondary_btn_text', allow_blank=True, required=False)
    secondaryBtnLink = serializers.CharField(source='secondary_btn_link', allow_blank=True, required=False)
    jsonData = serializers.JSONField(source='json_data', required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)

    class Meta:
        model = PageSection
        fields = [
            'id', 'sectionKey', 'sectionName', 'badgeText', 'title',
            'subtitle', 'content', 'mediaUrl', 'primaryBtnText',
            'primaryBtnLink', 'secondaryBtnText', 'secondaryBtnLink',
            'jsonData', 'order', 'isActive', 'updated_at'
        ]


class PageSerializer(serializers.ModelSerializer):
    sections = PageSectionSerializer(many=True, read_only=True)
    sectionMap = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = ['id', 'slug', 'title', 'meta_title', 'meta_description', 'is_published', 'sections', 'sectionMap']

    def get_sectionMap(self, obj):
        result = {}
        for sec in obj.sections.filter(is_active=True):
            result[sec.section_key] = {
                'id': sec.id,
                'title': sec.title,
                'subtitle': sec.subtitle,
                'badgeText': sec.badge_text,
                'content': sec.content,
                'mediaUrl': sec.media_url,
                'primaryBtnText': sec.primary_btn_text,
                'primaryBtnLink': sec.primary_btn_link,
                'secondaryBtnText': sec.secondary_btn_text,
                'secondaryBtnLink': sec.secondary_btn_link,
                'jsonData': sec.json_data,
            }
        return result
