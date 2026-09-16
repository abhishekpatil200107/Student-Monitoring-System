from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SubjectViewSet

router = DefaultRouter()
router.register("", SubjectViewSet)

urlpatterns = [
    path("", include(router.urls)),
]