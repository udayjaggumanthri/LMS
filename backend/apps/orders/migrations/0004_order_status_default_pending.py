from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_paymenttransaction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(default='pending', max_length=30),
        ),
    ]
