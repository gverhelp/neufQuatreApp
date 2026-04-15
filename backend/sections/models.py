from django.db import models
from django.db.models import Q
from django.utils.text import slugify
from django.core.exceptions import ValidationError

# Create your models here.
class Section(models.Model):
    name = models.CharField(max_length=100, blank=False, null=False)
    slug = models.SlugField(max_length=100, blank=True)
    showcaseImage = models.ImageField(upload_to='sections-images/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    bankAccount = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    uniformDescription = models.TextField(blank=True, null=True)
    uniformImage = models.ImageField(upload_to='uniformes-images/', blank=True, null=True)
    filled = models.IntegerField(default=0, blank=True, null=True)
    
    def clean(self):
        if not self.pk and Section.objects.count() >= 9:
            raise ValidationError("Impossible d'ajouter une section supplémentaire.")
        
    def delete(self, *args, **kwargs):
        raise ValidationError("Impossible de supprimer une section.")

    def save(self, *args, **kwargs):
        if not self.slug or self.slug != slugify(self.name):
            self.slug = slugify(self.name)
        self.full_clean()  # Appelle clean() avant de sauvegarder
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class SectionImage(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='sections-images/', blank=False, null=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, blank=False, null=False)
    
    def __str__(self):
        return f"Image de {self.section.name}"
    
    
class Chef(models.Model):
    name = models.CharField(max_length=100, blank=False, null=False)
    totem = models.CharField(max_length=100, blank=True, null=True)
    bafouille = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='chefs-images/', blank=True, null=True)
    phoneNumber = models.CharField(max_length=100, blank=True, null=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, blank=False, null=False)
    chefResp = models.BooleanField(default=False, verbose_name="Chef responsable")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['section'],
                condition=Q(chefResp=True),
                name='unique_chef_resp_per_section',
            )
        ]

    def __str__(self):
        return self.name
