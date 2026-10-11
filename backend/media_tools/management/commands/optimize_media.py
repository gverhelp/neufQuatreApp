from django.apps import apps
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from media_tools.optimize import IMAGE_FIELDS, optimize_bytes, optimized_name


class Command(BaseCommand):
    help = (
        "Optimise les images déjà en ligne (redimensionnement + recompression). "
        "Chaque image optimisée est écrite sous un nouveau nom et la base pointe dessus : "
        "les originaux restent sur le disque."
    )

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help="Calcule les gains sans rien modifier.")

    def handle(self, *args, dry_run=False, **options):
        total_before = total_after = count = 0

        for (app_label, model_name, field_name), max_side in IMAGE_FIELDS.items():
            model = apps.get_model(app_label, model_name)
            private = app_label == 'radio_camp'
            for obj in model.objects.exclude(**{field_name: ''}).exclude(**{f'{field_name}__isnull': True}):
                file = getattr(obj, field_name)
                if file.name.rsplit('.', 1)[0].endswith('_web'):
                    continue  # déjà optimisée
                try:
                    with file.open('rb') as f:
                        data = f.read()
                except FileNotFoundError:
                    self.stderr.write(f'  introuvable : {file.name}')
                    continue

                optimized = optimize_bytes(data, max_side)
                if not optimized:
                    continue

                count += 1
                total_before += len(data)
                total_after += len(optimized)
                self.stdout.write(
                    f'  {model_name}.{field_name} #{obj.pk} {file.name} : '
                    f'{len(data) // 1024} Ko → {len(optimized) // 1024} Ko'
                )
                if dry_run:
                    continue

                new_name = file.storage.save(optimized_name(file.name, private), ContentFile(optimized))
                # update() : pas de save() → ni validations des modèles, ni nouvelle optimisation
                model.objects.filter(pk=obj.pk).update(**{field_name: new_name})

        verb = 'seraient optimisées' if dry_run else 'optimisées'
        self.stdout.write(self.style.SUCCESS(
            f'{count} image(s) {verb} : {total_before // 1024 // 1024} Mo → {total_after // 1024 // 1024} Mo'
        ))
