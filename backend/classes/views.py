from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Class
from .serializers import ClassSerializer


class ClassViewSet(viewsets.ModelViewSet):

    queryset = Class.objects.filter(status=True)
    serializer_class = ClassSerializer

    def get_permissions(self):

        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        return [IsAuthenticated()]