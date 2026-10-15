from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_governance', '0007_production_readiness'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='callback_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='failure_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='success_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
    ]
