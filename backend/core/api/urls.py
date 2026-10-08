from rest_framework.routers import DefaultRouter
from accueil.api.urls import accueil_router
from sections.api.urls import sections_router
from agenda.api.urls import agenda_router
from radio_camp.api.urls import radio_camp_router
from infos.api.urls import infos_router
from django.urls import path, include
from radio_camp.api.views import VerifyRadioCampPassword, RadioCampsBySection
from agenda.api.views import events_ics

router = DefaultRouter()
router.registry.extend(accueil_router.registry)
router.registry.extend(sections_router.registry)
router.registry.extend(agenda_router.registry)
router.registry.extend(radio_camp_router.registry)
router.registry.extend(infos_router.registry)

urlpatterns = [
    # Avant le router : sinon `events/<pk>.<format>` intercepte « calendar.ics »
    path('events/calendar.ics', events_ics, name='events-ics'),
    path('radio-camps/by-section/<str:section_slug>/', RadioCampsBySection.as_view(), name='radio-camps-by-section'),
    path('radio-camps/<int:pk>/verify-password/', VerifyRadioCampPassword.as_view(), name='verify-radio-camp-password'),
    path('', include(router.urls)),
]
