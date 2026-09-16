from rest_framework import serializers
from .models import DailyDiary


class DailyDiarySerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.name",
        read_only=True
    )

    study_hours = serializers.DecimalField(
        max_digits=4,
        decimal_places=1
    )

    class Meta:
        model = DailyDiary
        fields = [
            "id",
            "student",
            "student_name",
            "date",
            "subject",
            "study_hours",
            "homework",
            "topics",
            "remarks",
            "parent_signature",
            "status",
            "created_at",
        ]