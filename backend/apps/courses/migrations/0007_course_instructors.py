from django.conf import settings
from django.db import migrations, models


def copy_lead_instructor(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    for course in Course.objects.exclude(instructor_id=None).iterator():
        course.instructors.add(course.instructor_id)


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('courses', '0006_category_is_top'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='instructors',
            field=models.ManyToManyField(blank=True, related_name='assigned_courses', to=settings.AUTH_USER_MODEL),
        ),
        migrations.RunPython(copy_lead_instructor, migrations.RunPython.noop),
    ]
