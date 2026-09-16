from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CodingProfileViewSet


router = DefaultRouter()

router.register(
    "",
    CodingProfileViewSet,
    basename="coding"
)


urlpatterns = [
    path("", include(router.urls)),
]