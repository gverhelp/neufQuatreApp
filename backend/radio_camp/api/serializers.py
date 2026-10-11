from django.urls import reverse
from rest_framework import serializers
from ..models import RadioCamp, Post, Photo, Video
from sections.models import Section


def _protected_url(serializer, route, pk):
    url = reverse(route, args=[pk])
    request = serializer.context.get('request')
    return request.build_absolute_uri(url) if request else url


class VideoSerializer(serializers.ModelSerializer):
    # URL vers la vue protégée (vérifie le mot de passe du camp), jamais vers /media/
    video = serializers.SerializerMethodField()

    def get_video(self, obj):
        return _protected_url(self, 'radio-camp-video-file', obj.pk)

    class Meta:
        model = Video
        fields = ['id', 'post', 'video', 'caption']

class PhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        return _protected_url(self, 'radio-camp-photo-file', obj.pk)

    class Meta:
        model = Photo
        fields = ['id', 'post', 'image', 'caption']
        
class PostSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    radio_camp = RadioCamp()

    class Meta:
        model = Post
        fields = ['id', 'radio_camp', 'title', 'content', 'date', 'photos', 'videos']

class RadioCampSerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Section.objects.all()
    )
    posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = RadioCamp
        fields = ['id', 'section', 'title', 'start_date', 'end_date', 'posts']


class RadioCampSummarySerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(slug_field='slug', read_only=True)

    class Meta:
        model = RadioCamp
        fields = ['id', 'section', 'title', 'start_date', 'end_date']
