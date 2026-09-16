from rest_framework import serializers

from .models import Class


class ClassSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    class Meta:
        model = Class
        fields = [
            "id",
            "name",
            "department",
            "department_name",
            "year",
            "division",
            "status",
            "created_at",
            "updated_at",
        ]