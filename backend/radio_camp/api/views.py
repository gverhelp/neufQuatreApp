import mimetypes
from datetime import timedelta
from urllib.parse import quote

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse

from ..models import RadioCamp, Section, Photo, Video
from .serializers import RadioCampSerializer, RadioCampSummarySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework.exceptions import Throttled, PermissionDenied
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password
from django.utils import timezone


RADIO_CAMP_ACCESS_TTL = timedelta(hours=24)
RADIO_CAMP_SESSION_KEY = 'radio_camp_access'


def _session_key(camp_id):
    return str(camp_id)


def has_camp_access(request, camp_id):
    """Le mot de passe de ce camp a-t-il été validé dans cette session (il y a moins de 24 h) ?"""
    access = request.session.get(RADIO_CAMP_SESSION_KEY, {})
    granted_at_iso = access.get(_session_key(camp_id))
    if not granted_at_iso:
        return False
    granted_at = timezone.datetime.fromisoformat(granted_at_iso)
    if timezone.now() - granted_at > RADIO_CAMP_ACCESS_TTL:
        access.pop(_session_key(camp_id), None)
        request.session[RADIO_CAMP_SESSION_KEY] = access
        request.session.modified = True
        return False
    return True


class PasswordVerifyThrottle(AnonRateThrottle):
    scope = 'password_verify'

# Détail d'un camp uniquement (protégé par mot de passe).
# Pas de liste : elle exposerait les posts, photos et vidéos de tous les camps.
class RadioCampViewSet(RetrieveModelMixin, GenericViewSet):
    queryset = RadioCamp.objects.all()
    serializer_class = RadioCampSerializer

    def retrieve(self, request, *args, **kwargs):
        if not has_camp_access(request, kwargs.get('pk')):
            raise PermissionDenied('Mot de passe requis.')
        return super().retrieve(request, *args, **kwargs)

# List of radio camps for a given section (lightweight, no auth required)
class RadioCampsBySection(APIView):
    permission_classes = [AllowAny]

    def get(self, request, section_slug):
        section = get_object_or_404(Section, slug=section_slug)
        camps = RadioCamp.objects.filter(section=section).order_by('-start_date')
        serializer = RadioCampSummarySerializer(camps, many=True)
        return Response(serializer.data)


# API View to verify the password for a specific RadioCamp
class VerifyRadioCampPassword(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordVerifyThrottle]

    def throttled(self, request, wait):
        raise Throttled(detail=f"Trop de tentatives. Réessayez dans {round(wait)} seconde(s).")

    def post(self, request, pk):
        password_input = request.data.get("password")

        radio_camp = get_object_or_404(RadioCamp, pk=pk)

        if check_password(password_input, radio_camp.password):
            access = request.session.get(RADIO_CAMP_SESSION_KEY, {})
            access[_session_key(radio_camp.pk)] = timezone.now().isoformat()
            request.session[RADIO_CAMP_SESSION_KEY] = access
            request.session.modified = True
            return Response({"success": True})
        else:
            return Response({"success": False, "error": "Mot de passe invalide."})


# ── Fichiers des Radio Camps (photos / vidéos) ──────────────────────────
# Les fichiers ne sont jamais servis directement par nginx (/media/radio_camp_* est bloqué).
# Django vérifie l'accès au camp, puis :
#   - en prod : délègue l'envoi à nginx via X-Accel-Redirect (location interne /protected-media/)
#   - en dev  : envoie le fichier lui-même
def _serve_protected(field_file):
    if settings.PROTECTED_MEDIA_X_ACCEL:
        response = HttpResponse()
        response['X-Accel-Redirect'] = f'/protected-media/{quote(field_file.name)}'
        response['Content-Type'] = mimetypes.guess_type(field_file.name)[0] or 'application/octet-stream'
    else:
        response = FileResponse(field_file.open('rb'))
    response['Cache-Control'] = 'private, max-age=3600'
    return response


def _can_view_camp(request, camp_id):
    # Le staff connecté à l'admin voit tout ; les parents, seulement le camp dont ils ont le mot de passe
    return request.user.is_staff or has_camp_access(request, camp_id)


def radio_camp_photo_file(request, pk):
    photo = Photo.objects.select_related('post').filter(pk=pk).first()
    # 404 dans tous les cas d'échec : on ne révèle pas l'existence d'un fichier
    if not photo or not _can_view_camp(request, photo.post.radio_camp_id):
        raise Http404
    return _serve_protected(photo.image)


def radio_camp_video_file(request, pk):
    video = Video.objects.select_related('post').filter(pk=pk).first()
    if not video or not _can_view_camp(request, video.post.radio_camp_id):
        raise Http404
    return _serve_protected(video.video)
