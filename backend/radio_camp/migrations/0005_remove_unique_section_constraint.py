from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('radio_camp', '0004_video'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='radiocamp',
            name='unique_section_radiocamp',
        ),
        migrations.AlterModelOptions(
            name='radiocamp',
            options={'ordering': ['-start_date']},
        ),
    ]
