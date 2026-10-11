from django import forms
from django.contrib import admin
from django.contrib.admin.widgets import AdminFileWidget
from django.urls import reverse

from .models import RadioCamp, Post, Photo, Video


# Les fichiers des camps ne sont plus accessibles via /media/ (bloqué par nginx).
# Dans l'admin, le lien « Actuellement : … » pointe donc vers la vue protégée.
class _ProtectedFile:
    def __init__(self, name, url):
        self.name, self.url = name, url

    def __str__(self):
        return self.name


class ProtectedFileWidget(AdminFileWidget):
    protected_url = None

    def format_value(self, value):
        value = super().format_value(value)
        if value and self.protected_url:
            return _ProtectedFile(str(value), self.protected_url)
        return value


def _protected_inline_form(model, field, route):
    class Form(forms.ModelForm):
        class Meta:
            fields = '__all__'
            widgets = {field: ProtectedFileWidget}

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            if self.instance.pk:
                self.fields[field].widget.protected_url = reverse(route, args=[self.instance.pk])

    Form.Meta.model = model
    return Form


class PhotoInline(admin.TabularInline):
    model = Photo
    form = _protected_inline_form(Photo, 'image', 'radio-camp-photo-file')
    extra = 1


class VideoInline(admin.TabularInline):
    model = Video
    form = _protected_inline_form(Video, 'video', 'radio-camp-video-file')
    extra = 1


class PostAdmin(admin.ModelAdmin):
    inlines = [PhotoInline, VideoInline]
    list_display = ['title', 'radio_camp', 'date']
    search_fields = ['title', 'radio_camp__section__name', 'radio_camp__title']
    ordering = ['radio_camp__section', 'date']
    list_filter = ['radio_camp__section']
    
class RadioCampAdmin(admin.ModelAdmin):
    list_display = ['title', 'section', 'start_date', 'end_date']
    search_fields = ['title', 'section__name']
    list_filter = ['section']

admin.site.register(RadioCamp, RadioCampAdmin)
admin.site.register(Post, PostAdmin)
