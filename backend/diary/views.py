from rest_framework import viewsets

from .models import DailyDiary
from .serializers import DailyDiarySerializer


class DailyDiaryViewSet(viewsets.ModelViewSet):
    queryset = (
        DailyDiary.objects
        .select_related("student")
        .order_by("-date", "-id")
    )
    serializer_class = DailyDiarySerializer