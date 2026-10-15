from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0005_production_readiness'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_top',
            field=models.BooleanField(default=False),
        ),
    ]
