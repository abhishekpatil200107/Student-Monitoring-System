from rest_framework import viewsets

from .models import CodingProfile
from .serializers import CodingProfileSerializer


class CodingProfileViewSet(viewsets.ModelViewSet):
    queryset = (
        CodingProfile.objects
        .select_related("student")
        .order_by("-updated_at")
    )

    serializer_class = CodingProfileSerializer