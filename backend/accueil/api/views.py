
from ..models import AccueilItem, AccueilButton, Inscription
from .serializers import AccueilItemSerializer, AccueilButtonSerializer, InscriptionSerializer
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

class AccueilItemViewSet(ReadOnlyModelViewSet):
    queryset = AccueilItem.objects.all()
    serializer_class = AccueilItemSerializer


class AccueilButtonViewSet(ReadOnlyModelViewSet):
    queryset = AccueilButton.objects.all()
    serializer_class = AccueilButtonSerializer

# GET /api/inscriptions/ : état des inscriptions (accueil + page Infos & documents)
class InscriptionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(InscriptionSerializer(Inscription.load()).data)
