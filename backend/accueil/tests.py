from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import Inscription


class InscriptionTests(TestCase):
    def test_api_returns_settings(self):
        Inscription.objects.update_or_create(pk=1, defaults={
            'ouvertes': True, 'lien_formulaire': 'https://forms.example.com/x', 'titre': 'Inscriptions 2026-2027',
        })
        data = self.client.get('/api/inscriptions/').json()
        self.assertEqual(data['ouvertes'], True)
        self.assertEqual(data['lien_formulaire'], 'https://forms.example.com/x')
        self.assertEqual(data['titre'], 'Inscriptions 2026-2027')

    def test_api_works_without_existing_row(self):
        Inscription.objects.all().delete()
        data = self.client.get('/api/inscriptions/').json()
        self.assertEqual(data['ouvertes'], False)

    def test_cannot_open_without_link(self):
        with self.assertRaises(ValidationError):
            Inscription(ouvertes=True, lien_formulaire='').full_clean()
