from django.db import models
from students.models import Student


class CodingProfile(models.Model):

    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name="coding_profile",
    )

    leetcode_url = models.URLField(
        blank=True,
        null=True,
    )

    hackerrank_url = models.URLField(
        blank=True,
        null=True,
    )

    codechef_url = models.URLField(
        blank=True,
        null=True,
    )

    geeksforgeeks_url = models.URLField(
        blank=True,
        null=True,
    )

    github_url = models.URLField(
        blank=True,
        null=True,
    )

    other_url = models.URLField(
        blank=True,
        null=True,
    )

    other_platform = models.CharField(
        max_length=100,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.student.name} - Coding Profile"