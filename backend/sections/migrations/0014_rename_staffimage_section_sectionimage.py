# Generated by Django 5.1.7 on 2025-04-09 14:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0013_section_staffimage'),
    ]

    operations = [
        migrations.RenameField(
            model_name='section',
            old_name='staffImage',
            new_name='sectionImage',
        ),
    ]
