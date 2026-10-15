from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_payment_hub'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='tax_invoice_number',
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='order',
            name='billing_name',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='order',
            name='billing_phone',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='order',
            name='billing_email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
    ]
