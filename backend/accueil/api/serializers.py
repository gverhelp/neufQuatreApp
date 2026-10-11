from rest_framework import serializers
from ..models import AccueilItem, AccueilButton, Inscription

class AccueilItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccueilItem
        fields = '__all__'

class AccueilButtonSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccueilButton
        fields = '__all__'



class InscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscription
        fields = ['ouvertes', 'lien_formulaire', 'titre', 'texte']
