from django.db import models
from apps.core.models import TimeStampedModel

class Page(TimeStampedModel):
    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    meta_title = models.CharField(max_length=255, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['slug']

    def __str__(self):
        return f"{self.title} (/{self.slug})"


class PageSection(TimeStampedModel):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='sections')
    section_key = models.CharField(max_length=100)
    section_name = models.CharField(max_length=150, help_text="Human-friendly label in admin editor")
    
    # Visual Text Elements
    badge_text = models.CharField(max_length=100, blank=True, default='')
    title = models.CharField(max_length=300, blank=True, default='')
    subtitle = models.TextField(blank=True, default='')
    content = models.TextField(blank=True, default='')
    media_url = models.URLField(max_length=500, blank=True, default='')
    
    # CTA Action Links
    primary_btn_text = models.CharField(max_length=100, blank=True, default='')
    primary_btn_link = models.CharField(max_length=255, blank=True, default='')
    secondary_btn_text = models.CharField(max_length=100, blank=True, default='')
    secondary_btn_link = models.CharField(max_length=255, blank=True, default='')
    
    # Flexible structured props (for lists, cards, stats, FAQs)
    json_data = models.JSONField(default=dict, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('page', 'section_key')
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.page.slug} :: {self.section_key} ({self.section_name})"


class BlogCategory(TimeStampedModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        verbose_name_plural = 'Blog Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class BlogPost(TimeStampedModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.CharField(max_length=100, default='Technology')
    category_rel = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    excerpt = models.TextField(help_text="Short teaser paragraph for cards and SEO")
    content = models.TextField(help_text="Full markdown or HTML content")
    cover_image = models.URLField(max_length=500, blank=True, default='')
    author_name = models.CharField(max_length=150, default='Prajnadhara Faculty')
    author_avatar = models.URLField(max_length=500, blank=True, default='')
    author_role = models.CharField(max_length=150, blank=True, default='Lead Instructor')
    read_time = models.CharField(max_length=50, default='5 min read')
    views_count = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
