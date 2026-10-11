"""
Optimisation des images importées via l'admin.

- redimensionne au-delà d'une taille max (côté le plus long), selon l'usage de l'image
- applique l'orientation EXIF (sinon les photos de téléphone apparaissent couchées)
- recompresse dans le même format (JPEG → JPEG, PNG → PNG, WebP → WebP)
- ne garde le résultat que s'il est réellement plus léger
"""
import io
import os

from PIL import Image, ImageOps

# (app, modèle, champ) → côté max en pixels
IMAGE_FIELDS = {
    ('accueil', 'AccueilItem', 'image'): 2000,
    ('sections', 'Section', 'showcaseImage'): 2400,   # bandeau plein écran de la page section
    ('sections', 'Section', 'uniformImage'): 1600,
    ('sections', 'SectionImage', 'image'): 2000,       # carrousel
    ('sections', 'Chef', 'image'): 1000,               # photo de carte (~400 px affichés)
    ('infos', 'Info', 'image'): 1600,
    ('radio_camp', 'Photo', 'image'): 2000,
}

FORMATS = {
    'JPEG': {'format': 'JPEG', 'quality': 82, 'optimize': True, 'progressive': True},
    'PNG':  {'format': 'PNG', 'optimize': True},
    'WEBP': {'format': 'WEBP', 'quality': 80, 'method': 6},
}


def optimize_bytes(data, max_side):
    """Renvoie les octets optimisés, ou None si l'image n'y gagne rien (ou format non géré)."""
    try:
        im = Image.open(io.BytesIO(data))
        fmt = im.format
        if fmt not in FORMATS:
            return None
        im = ImageOps.exif_transpose(im)
    except Exception:
        return None

    resized = max(im.size) > max_side
    if resized:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    if fmt == 'JPEG' and im.mode not in ('RGB', 'L'):
        im = im.convert('RGB')

    out = io.BytesIO()
    im.save(out, **FORMATS[fmt])
    result = out.getvalue()
    # Sans redimensionnement, on ne réécrit que si le gain dépasse 10 %
    if not resized and len(result) > len(data) * 0.9:
        return None
    return result


def optimized_name(name, private):
    """Nouveau nom pour une image existante : l'original reste en place (retour arrière possible)."""
    folder, base = os.path.split(name)
    stem, ext = os.path.splitext(base)
    if private:
        import uuid
        return f'{folder}/{uuid.uuid4().hex}{ext.lower()}'
    return f'{folder}/{stem}_web{ext.lower()}'
