from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.

class AccueilItem(models.Model):
    titre = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='images/', blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titre
    
    def clean(self):
        if not self.pk and AccueilItem.objects.count() >= 2:
            # Interdire la création si déjà 2 objets existent
            raise ValidationError("Il existe déjà 2 Accueil Items. Vous ne pouvez en avoir que 2 à la fois.")
        
    def delete(self, *args, **kwargs):
        if AccueilItem.objects.count() <= 2:
            raise ValidationError("Impossible de supprimer cet élément : il doit toujours y avoir au moins 2 Accueil Items.")
        super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        self.full_clean()  # Appelle clean() avant de sauvegarder
        super().save(*args, **kwargs)
        
        
# Bouton « Nous contacter » de l'accueil (l'inscription a son propre réglage : Inscription)
class AccueilButton(models.Model):
    link = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bouton de contact"
        verbose_name_plural = "Bouton de contact"

    def __str__(self):
        return "Bouton de contact"

    def clean(self):
        if not self.pk and AccueilButton.objects.exists():
            raise ValidationError("Il existe déjà un bouton de contact.")

    def delete(self, *args, **kwargs):
        raise ValidationError("Impossible de supprimer le bouton de contact.")

    def save(self, *args, **kwargs):
        self.full_clean()  # Appelle clean() avant de sauvegarder
        super().save(*args, **kwargs)


class Inscription(models.Model):
    """
    Réglage unique des inscriptions : utilisé par le bouton « S'inscrire » de l'accueil
    et par le bandeau de la page Infos & documents.
    """
    ouvertes = models.BooleanField(
        "Inscriptions ouvertes", default=False,
        help_text="Décocher pour fermer les inscriptions : le bouton de l'accueil affiche alors un message.",
    )
    lien_formulaire = models.URLField(
        "Lien du formulaire", max_length=500, blank=True,
        help_text="Formulaire d'inscription (Google Forms…). Obligatoire quand les inscriptions sont ouvertes.",
    )
    titre = models.CharField(max_length=100, default="Les inscriptions sont ouvertes")
    texte = models.CharField(
        max_length=255, blank=True,
        default="Inscris ton enfant pour la nouvelle année via le formulaire en ligne.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inscriptions"
        verbose_name_plural = "Inscriptions"

    def __str__(self):
        return "Inscriptions ouvertes" if self.ouvertes else "Inscriptions fermées"

    def clean(self):
        if self.ouvertes and not self.lien_formulaire:
            raise ValidationError({'lien_formulaire': "Indique le lien du formulaire pour ouvrir les inscriptions."})

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj