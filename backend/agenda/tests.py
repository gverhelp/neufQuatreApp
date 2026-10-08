from datetime import datetime, timezone as dt_timezone

from django.test import TestCase
from django.urls import reverse

from sections.models import Section
from .models import Event


class EventsIcsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.baladins = Section.objects.create(name='Baladins')
        cls.unite = Section.objects.create(name='Unité')
        Event.objects.create(
            title='Week-end, camp; été',
            description='Ligne 1\nLigne 2',
            start_time=datetime(2026, 11, 7, 9, 0, tzinfo=dt_timezone.utc),
            end_time=datetime(2026, 11, 8, 17, 0, tzinfo=dt_timezone.utc),
            location='Forest',
            section=cls.baladins,
        )
        Event.objects.create(
            title='Fête d\'unité',
            start_time=datetime(2026, 12, 5, 14, 0, tzinfo=dt_timezone.utc),
            end_time=datetime(2026, 12, 5, 18, 0, tzinfo=dt_timezone.utc),
            section=cls.unite,
        )

    def get_ics(self, params=''):
        response = self.client.get(reverse('events-ics') + params)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response['Content-Type'].startswith('text/calendar'))
        return response.content.decode('utf-8')

    def test_all_events_without_filter(self):
        body = self.get_ics()
        self.assertTrue(body.startswith('BEGIN:VCALENDAR\r\n'))
        self.assertTrue(body.endswith('END:VCALENDAR\r\n'))
        self.assertEqual(body.count('BEGIN:VEVENT'), 2)
        self.assertIn('X-WR-CALNAME:94ème Saint-Augustin\r\n', body)

    def test_filter_by_sections(self):
        body = self.get_ics('?sections=unite')
        self.assertEqual(body.count('BEGIN:VEVENT'), 1)
        self.assertIn("SUMMARY:[Unité] Fête d'unité", body)
        self.assertIn('X-WR-CALNAME:94ème Saint-Augustin — Unité', body)

    def test_escaping_and_utc_dates(self):
        body = self.get_ics('?sections=baladins')
        self.assertIn('SUMMARY:[Baladins] Week-end\\, camp\\; été', body)
        self.assertIn('DTSTART:20261107T090000Z', body)
        self.assertIn('LOCATION:Forest', body)
        unfolded = body.replace('\r\n ', '')
        self.assertIn('DESCRIPTION:Ligne 1\\nLigne 2\\n\\nSection : Baladins', unfolded)

    def test_lines_are_folded(self):
        body = self.get_ics()
        for line in body.split('\r\n'):
            self.assertLessEqual(len(line.encode('utf-8')), 75)
