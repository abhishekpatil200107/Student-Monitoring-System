from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):

    queryset = Department.objects.filter(status=True)
    serializer_class = DepartmentSerializer

    def get_permissions(self):

        if self.action == "list" or self.action == "retrieve":
            return [AllowAny()]

        return [IsAuthenticated()]