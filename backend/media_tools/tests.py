import io
import shutil
import tempfile

from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings

from sections.models import Section, Chef
from .optimize import optimize_bytes

TMP_MEDIA = tempfile.mkdtemp()


def jpeg(w, h, orientation=None, quality=95):
    im = Image.new('RGB', (w, h), (30, 120, 200))
    out = io.BytesIO()
    if orientation:
        exif = Image.Exif()
        exif[0x0112] = orientation
        im.save(out, 'JPEG', quality=quality, exif=exif)
    else:
        im.save(out, 'JPEG', quality=quality)
    return out.getvalue()


def size_of(field_file):
    with field_file.open('rb') as f:
        return Image.open(f).size


@override_settings(MEDIA_ROOT=TMP_MEDIA)
class MediaOptimizationTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP_MEDIA, ignore_errors=True)

    def setUp(self):
        self.section = Section.objects.create(name='Pionniers')

    def test_new_upload_is_resized(self):
        chef = Chef.objects.create(
            name='Ocelot', section=self.section,
            image=SimpleUploadedFile('photo.jpg', jpeg(3000, 2000), 'image/jpeg'),
        )
        self.assertEqual(size_of(chef.image), (1000, 667))

    def test_exif_orientation_is_applied(self):
        # Orientation 6 = photo de téléphone tenue verticalement : 3000x2000 stockée, 2000x3000 affichée
        chef = Chef.objects.create(
            name='Phone', section=self.section,
            image=SimpleUploadedFile('phone.jpg', jpeg(3000, 2000, orientation=6), 'image/jpeg'),
        )
        self.assertEqual(size_of(chef.image), (667, 1000))

    def test_already_optimized_image_left_untouched(self):
        # Idempotent : une image déjà passée par l'optimiseur n'est pas retraitée
        once = optimize_bytes(jpeg(3000, 2000), 1000)
        self.assertIsNone(optimize_bytes(once, 1000))

    def test_small_heavy_image_is_recompressed(self):
        data = jpeg(400, 300, quality=100)
        self.assertLess(len(optimize_bytes(data, 1000)), len(data) * 0.9)

    def test_command_keeps_originals(self):
        # Image « historique » : écrite sans passer par l'optimisation à l'upload
        chef = Chef.objects.create(name='Ancien', section=self.section)
        name = chef.image.storage.save('chefs-images/ancien.jpg', ContentFile(jpeg(3000, 2000)))
        Chef.objects.filter(pk=chef.pk).update(image=name)

        call_command('optimize_media', '--dry-run', stdout=io.StringIO())
        chef.refresh_from_db()
        self.assertEqual(chef.image.name, 'chefs-images/ancien.jpg')

        call_command('optimize_media', stdout=io.StringIO())
        chef.refresh_from_db()
        self.assertEqual(chef.image.name, 'chefs-images/ancien_web.jpg')
        self.assertEqual(size_of(chef.image), (1000, 667))
        self.assertTrue(chef.image.storage.exists('chefs-images/ancien.jpg'))  # original conservé
