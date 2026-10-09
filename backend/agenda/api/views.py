from datetime import timezone as dt_timezone

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_GET

from sections.models import Section

from ..models import Event, AgendaDocument
from .serializers import EventSerializer, AgendaDocumentSerializer
from rest_framework.viewsets import ReadOnlyModelViewSet


class EventViewSet(ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class AgendaDocumentViewSet(ReadOnlyModelViewSet):
    queryset = AgendaDocument.objects.all()
    serializer_class = AgendaDocumentSerializer


# ── Flux iCal (abonnement Google / Apple / Outlook) ─────────────────────

CALENDAR_NAME = '94ème Saint-Augustin'
UID_DOMAIN = 'unitesaintaugustin94.be'


def _ics_escape(value):
    return (
        value.replace('\\', '\\\\')
        .replace(';', '\\;')
        .replace(',', '\\,')
        .replace('\r\n', '\\n')
        .replace('\n', '\\n')
    )


def _ics_fold(line):
    # RFC 5545 : lignes de 75 octets max, continuation préfixée d'un espace
    out, buf = [], ''
    for char in line:
        limit = 75 if not out else 74
        if len((buf + char).encode('utf-8')) > limit:
            out.append(buf)
            buf = char
        else:
            buf += char
    out.append(buf)
    return '\r\n '.join(out)


def _ics_datetime(value):
    return value.astimezone(dt_timezone.utc).strftime('%Y%m%dT%H%M%SZ')


def _vevent_lines(event, dtstamp):
    description = f'Section : {event.section.name}'
    if event.description:
        description = f'{event.description}\n\n{description}'

    lines = [
        'BEGIN:VEVENT',
        f'UID:event-{event.pk}@{UID_DOMAIN}',
        f'DTSTAMP:{dtstamp}',
        f'DTSTART:{_ics_datetime(event.start_time)}',
        f'DTEND:{_ics_datetime(event.end_time)}',
        f'SUMMARY:{_ics_escape(f"[{event.section.name}] {event.title}")}',
        f'DESCRIPTION:{_ics_escape(description)}',
        f'CATEGORIES:{_ics_escape(event.section.name)}',
    ]
    if event.location:
        lines.append(f'LOCATION:{_ics_escape(event.location)}')
    lines.append('END:VEVENT')
    return lines


def _ics_response(header_lines, events, filename, disposition='inline'):
    dtstamp = _ics_datetime(timezone.now())
    lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        f'PRODID:-//{CALENDAR_NAME}//Agenda//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        *header_lines,
    ]
    for event in events:
        lines += _vevent_lines(event, dtstamp)
    lines.append('END:VCALENDAR')

    body = '\r\n'.join(_ics_fold(line) for line in lines) + '\r\n'
    response = HttpResponse(body, content_type='text/calendar; charset=utf-8')
    response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
    response['Cache-Control'] = 'public, max-age=900'
    return response


@require_GET
def events_ics(request):
    """
    GET /api/events/calendar.ics?sections=baladins,unite
    Flux d'abonnement. Sans paramètre `sections` : tous les événements de l'unité.
    """
    events = Event.objects.select_related('section').order_by('start_time')

    slugs = [s.strip() for s in request.GET.get('sections', '').split(',') if s.strip()]
    section_names = []
    if slugs:
        events = events.filter(section__slug__in=slugs)
        section_names = list(Section.objects.filter(slug__in=slugs).order_by('name').values_list('name', flat=True))

    cal_name = f"{CALENDAR_NAME} — {', '.join(section_names)}" if section_names else CALENDAR_NAME

    return _ics_response(
        [
            f'X-WR-CALNAME:{_ics_escape(cal_name)}',
            'X-WR-TIMEZONE:Europe/Brussels',
            'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
            'X-PUBLISHED-TTL:PT6H',
        ],
        events,
        'agenda-94-saint-augustin.ics',
    )


@require_GET
def event_ics(request, pk):
    """
    GET /api/events/<id>/calendar.ics
    Un seul événement, en fichier à importer (pas d'abonnement).
    """
    event = get_object_or_404(Event.objects.select_related('section'), pk=pk)
    return _ics_response([], [event], f'evenement-{event.pk}.ics', disposition='attachment')
