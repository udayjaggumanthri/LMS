from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class MediaFile(TimeStampedModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/%Y/%m/')
    file_type = models.CharField(max_length=50, blank=True, default='')
    file_size = models.BigIntegerField(default=0)
    uploaded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_media')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
