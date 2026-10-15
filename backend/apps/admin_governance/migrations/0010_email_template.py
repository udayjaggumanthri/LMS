from django.db import migrations, models


def seed_templates(apps, schema_editor):
    EmailTemplate = apps.get_model('admin_governance', 'EmailTemplate')
    from apps.core.email_defaults import DEFAULT_TEMPLATES

    for row in DEFAULT_TEMPLATES:
        EmailTemplate.objects.get_or_create(
            key=row['key'],
            defaults={
                'label': row['label'],
                'description': row['description'],
                'subject': row['subject'],
                'body_html': row['body_html'],
                'enabled': True,
                'placeholders': row['placeholders'],
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('admin_governance', '0009_single_gateway_endpoints'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('key', models.CharField(max_length=64, unique=True)),
                ('label', models.CharField(max_length=150)),
                ('description', models.TextField(blank=True, default='')),
                ('subject', models.CharField(max_length=255)),
                ('body_html', models.TextField()),
                ('enabled', models.BooleanField(default=True)),
                ('placeholders', models.JSONField(blank=True, default=list)),
            ],
            options={'ordering': ['label']},
        ),
        migrations.RunPython(seed_templates, migrations.RunPython.noop),
    ]
