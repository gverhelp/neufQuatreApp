from datetime import timedelta

from ..models import RadioCamp, Post, Photo, Video, Section
from .serializers import (
    RadioCampSerializer,
    RadioCampSummarySerializer,
    PostSerializer,
    PhotoSerializer,
    VideoSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework.exceptions import Throttled, PermissionDenied
from rest_framework.viewsets import ReadOnlyModelViewSet
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password
from django.utils import timezone


RADIO_CAMP_ACCESS_TTL = timedelta(hours=24)
RADIO_CAMP_SESSION_KEY = 'radio_camp_access'


def _session_key(camp_id):
    return str(camp_id)


class PasswordVerifyThrottle(AnonRateThrottle):
    scope = 'password_verify'

# ViewSets for the API
class RadioCampViewSet(ReadOnlyModelViewSet):
    queryset = RadioCamp.objects.all()
    serializer_class = RadioCampSerializer

    def retrieve(self, request, *args, **kwargs):
        camp_key = _session_key(kwargs.get('pk'))
        access = request.session.get(RADIO_CAMP_SESSION_KEY, {})
        granted_at_iso = access.get(camp_key)
        if not granted_at_iso:
            raise PermissionDenied('Mot de passe requis.')
        granted_at = timezone.datetime.fromisoformat(granted_at_iso)
        if timezone.now() - granted_at > RADIO_CAMP_ACCESS_TTL:
            access.pop(camp_key, None)
            request.session[RADIO_CAMP_SESSION_KEY] = access
            request.session.modified = True
            raise PermissionDenied('Accès expiré, veuillez ressaisir le mot de passe.')
        return super().retrieve(request, *args, **kwargs)

class PostViewSet(ReadOnlyModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class PhotoViewSet(ReadOnlyModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer

class VideoViewSet(ReadOnlyModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


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
