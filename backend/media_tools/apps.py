from django.apps import AppConfig, apps
from django.core.files.base import ContentFile
from django.db.models.signals import pre_save


class MediaToolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'media_tools'

    def ready(self):
        from .optimize import IMAGE_FIELDS

        for (app_label, model_name, field_name), max_side in IMAGE_FIELDS.items():
            model = apps.get_model(app_label, model_name)
            pre_save.connect(
                _make_optimizer(field_name, max_side),
                sender=model,
                weak=False,
                dispatch_uid=f'optimize-{app_label}-{model_name}-{field_name}',
            )


def _make_optimizer(field_name, max_side):
    def optimize_upload(sender, instance, **kwargs):
        from .optimize import optimize_bytes

        file = getattr(instance, field_name)
        # Uniquement un fichier tout juste importé (pas encore écrit sur le disque)
        if not file or getattr(file, '_committed', True):
            return
        file.seek(0)
        data = file.read()
        optimized = optimize_bytes(data, max_side)
        file.seek(0)
        if optimized:
            setattr(instance, field_name, ContentFile(optimized, name=file.name))

    return optimize_upload
