# Generated by Django 5.1.7 on 2025-04-29 16:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('infos', '0003_info_link'),
    ]

    operations = [
        migrations.RenameField(
            model_name='info',
            old_name='link',
            new_name='videoLink',
        ),
    ]
