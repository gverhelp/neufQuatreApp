from rest_framework.routers import DefaultRouter
from .views import RadioCampViewSet

# Les posts / photos / vidéos ne sont accessibles qu'à travers le détail d'un camp
# (/api/radio-camps/<id>/), lui-même protégé par mot de passe.
radio_camp_router = DefaultRouter()
radio_camp_router.register(r'radio-camps', RadioCampViewSet)
