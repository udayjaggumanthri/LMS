from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_governance', '0010_email_template'),
    ]

    operations = [
        migrations.AddField(
            model_name='platformsettings',
            name='legal_name',
            field=models.CharField(default='Prajnadhara', max_length=150),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='company_line',
            field=models.CharField(default='Infotech Pvt Ltd', max_length=150),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='invoice_address',
            field=models.TextField(
                default='1st Floor, 7-28-6, Tanvi Castle, Tyaga Raja Nagar, Rajamahendravaram, East Godavari, Andhra Pradesh, 533101.',
            ),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='invoice_phone',
            field=models.CharField(default='+91 9052513666', max_length=40),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='invoice_email',
            field=models.EmailField(default='info@prajnadharainfotech.com', max_length=254),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='gst_number',
            field=models.CharField(default='37AAQCP8786M1Z4', max_length=20),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='invoice_declaration',
            field=models.TextField(
                default='We declare that this invoice reflects the actual price of the services described and that all particulars are true and correct.',
            ),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='signature_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='stamp_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='platformsettings',
            name='invoice_next_number',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
