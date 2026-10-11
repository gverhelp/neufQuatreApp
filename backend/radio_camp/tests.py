import shutil
import tempfile
from datetime import date

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from sections.models import Section
from .models import RadioCamp, Post, Photo, Video

TMP_MEDIA = tempfile.mkdtemp()

# Plus petit GIF valide (1x1) : suffisant pour un ImageField
GIF = (b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00'
       b',\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;')


class RadioCampPrivacyTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        section = Section.objects.create(name='Louveteaux')
        cls.camp = RadioCamp.objects.create(
            section=section, title='Camp 2026', password='secret',
            start_date=date(2026, 7, 18), end_date=date(2026, 7, 30),
        )
        Post.objects.create(radio_camp=cls.camp, title='Jour 1', content='...', date=date(2026, 7, 18))

    def test_no_public_listing(self):
        for url in ('/api/radio-camps/', '/api/posts/', '/api/photos/', '/api/videos/'):
            self.assertEqual(self.client.get(url).status_code, 404, url)

    def test_detail_requires_password(self):
        self.assertEqual(self.client.get(f'/api/radio-camps/{self.camp.pk}/').status_code, 403)

    def test_detail_after_password(self):
        r = self.client.post(f'/api/radio-camps/{self.camp.pk}/verify-password/', {'password': 'secret'})
        self.assertTrue(r.json()['success'])
        r = self.client.get(f'/api/radio-camps/{self.camp.pk}/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()['posts']), 1)

    def test_global_summary_has_dates_only(self):
        r = self.client.get('/api/radio-camps/summary/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(set(r.json()[0]), {'id', 'section', 'title', 'start_date', 'end_date'})

    def test_section_summary_has_no_posts(self):
        r = self.client.get('/api/radio-camps/by-section/louveteaux/')
        self.assertEqual(r.status_code, 200)
        self.assertNotIn('posts', r.json()[0])


@override_settings(MEDIA_ROOT=TMP_MEDIA)
class RadioCampMediaTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        section = Section.objects.create(name='Lutins')
        cls.camp = RadioCamp.objects.create(
            section=section, title='Camp', password='secret',
            start_date=date(2026, 7, 1), end_date=date(2026, 7, 10),
        )
        cls.other_camp = RadioCamp.objects.create(
            section=section, title='Autre camp', password='autre',
            start_date=date(2025, 7, 1), end_date=date(2025, 7, 10),
        )
        post = Post.objects.create(radio_camp=cls.camp, title='Jour 1', content='...', date=date(2026, 7, 1))
        cls.photo = Photo.objects.create(post=post, image=SimpleUploadedFile('IMG_0001.gif', GIF, 'image/gif'))
        cls.video = Video.objects.create(post=post, video=SimpleUploadedFile('clip.MP4', b'fake', 'video/mp4'))

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP_MEDIA, ignore_errors=True)

    def login(self, camp, password):
        self.client.post(f'/api/radio-camps/{camp.pk}/verify-password/', {'password': password})

    def photo_url(self):
        return f'/api/radio-camps/photos/{self.photo.pk}/file/'

    def test_random_filenames(self):
        self.assertRegex(self.photo.image.name, r'^radio_camp_photos/[0-9a-f]{32}\.gif$')
        self.assertRegex(self.video.video.name, r'^radio_camp_videos/[0-9a-f]{32}\.mp4$')

    def test_file_hidden_without_password(self):
        self.assertEqual(self.client.get(self.photo_url()).status_code, 404)
        self.assertEqual(self.client.get(f'/api/radio-camps/videos/{self.video.pk}/file/').status_code, 404)

    def test_password_of_another_camp_is_not_enough(self):
        self.login(self.other_camp, 'autre')
        self.assertEqual(self.client.get(self.photo_url()).status_code, 404)

    def test_file_served_with_password(self):
        self.login(self.camp, 'secret')
        r = self.client.get(self.photo_url())
        self.assertEqual(r.status_code, 200)
        self.assertEqual(b''.join(r.streaming_content), GIF)
        self.assertIn('private', r['Cache-Control'])

    @override_settings(PROTECTED_MEDIA_X_ACCEL=True)
    def test_x_accel_redirect_in_production(self):
        self.login(self.camp, 'secret')
        r = self.client.get(self.photo_url())
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['X-Accel-Redirect'], f'/protected-media/{self.photo.image.name}')
        self.assertEqual(r['Content-Type'], 'image/gif')
        self.assertEqual(r.content, b'')

    def test_api_returns_protected_urls(self):
        self.login(self.camp, 'secret')
        data = self.client.get(f'/api/radio-camps/{self.camp.pk}/').json()
        post = data['posts'][0]
        self.assertTrue(post['photos'][0]['image'].endswith(self.photo_url()))
        self.assertTrue(post['videos'][0]['video'].endswith(f'/api/radio-camps/videos/{self.video.pk}/file/'))
        self.assertNotIn('/media/', str(data))

    def test_staff_sees_files_and_admin_links_to_protected_view(self):
        User.objects.create_superuser('chef', 'chef@example.com', 'pw')
        self.client.login(username='chef', password='pw')
        self.assertEqual(self.client.get(self.photo_url()).status_code, 200)
        page = self.client.get(f'/api/admin/radio_camp/post/{self.photo.post_id}/change/').content.decode()
        self.assertIn(f'href="{self.photo_url()}"', page)
        self.assertNotIn(f'/media/{self.photo.image.name}', page)
