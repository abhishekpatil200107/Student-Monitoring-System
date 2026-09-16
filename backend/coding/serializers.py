from rest_framework import serializers

from .models import CodingProfile


class CodingProfileSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.name",
        read_only=True
    )

    class Meta:
        model = CodingProfile

        fields = [
            "id",
            "student",
            "student_name",
            "leetcode_url",
            "hackerrank_url",
            "codechef_url",
            "geeksforgeeks_url",
            "github_url",
            "other_url",
            "other_platform",
            "created_at",
            "updated_at",
        ]