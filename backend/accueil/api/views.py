
from ..models import AccueilItem, AccueilButton
from .serializers import AccueilItemSerializer, AccueilButtonSerializer
from rest_framework.viewsets import ReadOnlyModelViewSet

class AccueilItemViewSet(ReadOnlyModelViewSet):
    queryset = AccueilItem.objects.all()
    serializer_class = AccueilItemSerializer


class AccueilButtonViewSet(ReadOnlyModelViewSet):
    queryset = AccueilButton.objects.all()
    serializer_class = AccueilButtonSerializer