from rest_framework import serializers

from .models import Subject

class SubjectSerializer(serializers.ModelSerializer):
 
    faculty_name = serializers.CharField(
        source="faculty.name",
        read_only=True,
    )

    class_name = serializers.CharField(
        source="class_relation.name",
        read_only=True,
    )

    class Meta:
        model = Subject

        fields = [
            "id",
            "code",
            "name",
            "department",
            "semester",
            "credits",
            "faculty",
            "faculty_name",
            "class_relation",
            "class_name",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "faculty_name",
            "class_name",
            "created_at",
        ]

