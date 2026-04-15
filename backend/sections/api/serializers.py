from rest_framework import serializers
from ..models import Section, SectionImage, Chef


class SectionImageSerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Section.objects.all()
    )
    
    class Meta:
        model = SectionImage
        fields = ['id', 'title', 'image', 'section']


class ChefSerializer(serializers.ModelSerializer):
    section = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Section.objects.all()
    )

    class Meta:
        model = Chef
        fields = ['id', 'name', 'totem', 'bafouille', 'image', 'phoneNumber', 'section', 'chefResp']


class SectionSerializer(serializers.ModelSerializer):
    section_images = SectionImageSerializer(source='sectionimage_set', many=True, read_only=True)
    chefs = ChefSerializer(source='chef_set', many=True, read_only=True)

    class Meta:
        model = Section
        fields = [
            'id', 'name', 'slug', 'showcaseImage', 'description', 'bankAccount', 'email',
            'uniformDescription', 'uniformImage', 'filled',
            'section_images', 'chefs'
        ]
        read_only_fields = ['slug', 'name']
