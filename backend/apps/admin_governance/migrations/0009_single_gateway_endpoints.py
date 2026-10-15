from django.db import migrations, models


def copy_active_endpoints(apps, schema_editor):
    PaymentGatewaySettings = apps.get_model('admin_governance', 'PaymentGatewaySettings')
    for row in PaymentGatewaySettings.objects.all():
        row.checkout_session_url = (row.api_endpoint_uat or row.api_endpoint_prod or '').strip()
        row.status_check_url = (row.status_check_endpoint_uat or row.status_check_endpoint_prod or '').strip()
        row.save(update_fields=['checkout_session_url', 'status_check_url'])


class Migration(migrations.Migration):

    dependencies = [
        ('admin_governance', '0008_payment_return_urls_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentgatewaysettings',
            name='checkout_session_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='paymentgatewaysettings',
            name='status_check_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.RunPython(copy_active_endpoints, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='api_endpoint_prod',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='api_endpoint_uat',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='merchant_portal_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='merchant_region_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='status_check_endpoint_prod',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='paymentgatewaysettings',
            name='status_check_endpoint_uat',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
