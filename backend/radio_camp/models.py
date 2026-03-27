from django.db import models
from sections.models import Section
from django.contrib.auth.hashers import make_password, identify_hasher


# Create your models here.
class RadioCamp(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='radio_camps')
    title = models.CharField(max_length=200, blank=True, null=True)
    password = models.CharField(max_length=200, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def save(self, *args, **kwargs):
        if self.password:
            try:
                identify_hasher(self.password)
            except ValueError:
                self.password = make_password(self.password)
        super().save(*args, **kwargs)
        
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["section"], name="unique_section_radiocamp")
        ]
        
    def __str__(self):
        return f"{self.title} - {self.section.name}"


class Post(models.Model):
    radio_camp = models.ForeignKey(RadioCamp, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    date = models.DateField()

    def __str__(self):
        return f"{self.title} - {self.radio_camp.section.name} - {self.date}"


class Photo(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='radio_camp_photos/')
    caption = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Photo de {self.post.title}"
    

class Video(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='videos')
    video = models.FileField(upload_to='radio_camp_videos/')
    caption = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Video de {self.post.title}"