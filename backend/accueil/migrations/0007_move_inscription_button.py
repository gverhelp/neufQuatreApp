from django.db import migrations


def forward(apps, schema_editor):
    """
    L'ancien « Bouton d'inscription » (AccueilButton au plus petit id, l'accueil utilisait
    buttons[0]) devient le réglage Inscription. Le bouton de contact reste un AccueilButton.
    """
    AccueilButton = apps.get_model('accueil', 'AccueilButton')
    Inscription = apps.get_model('accueil', 'Inscription')

    buttons = list(AccueilButton.objects.order_by('id'))
    inscription_button = None
    if len(buttons) >= 2:
        inscription_button = buttons[0]
    elif len(buttons) == 1 and not (buttons[0].link or '').startswith('mailto:'):
        inscription_button = buttons[0]

    link = (inscription_button.link or '').strip() if inscription_button else ''
    Inscription.objects.update_or_create(
        pk=1,
        defaults={'lien_formulaire': link, 'ouvertes': link.startswith('http')},
    )
    if inscription_button:
        # queryset.delete() : la méthode delete() du modèle l'interdirait
        AccueilButton.objects.filter(pk=inscription_button.pk).delete()


def backward(apps, schema_editor):
    AccueilButton = apps.get_model('accueil', 'AccueilButton')
    Inscription = apps.get_model('accueil', 'Inscription')
    insc = Inscription.objects.filter(pk=1).first()
    if insc:
        # L'ancien code prenait le bouton au plus petit id pour l'inscription : on reprend l'id 1 si libre
        free_id = None if AccueilButton.objects.filter(pk=1).exists() else 1
        AccueilButton.objects.create(id=free_id, link=insc.lien_formulaire or None)
        insc.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accueil', '0006_inscription'),
    ]

    operations = [
        migrations.RunPython(forward, backward),
    ]
