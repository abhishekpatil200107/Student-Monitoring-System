from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DailyDiaryViewSet

router = DefaultRouter()

router.register(
    "daily-diary",
    DailyDiaryViewSet,
    basename="daily-diary",
)

urlpatterns = [
    path("", include(router.urls)),
]