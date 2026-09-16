from django.db import models

from departments.models import Department


class Class(models.Model):
    name = models.CharField(
        max_length=100,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="classes",
    )

    year = models.CharField(
        max_length=10,
        blank=True,
    )

    division = models.CharField(
        max_length=5,
        blank=True,
    )

    status = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]
        unique_together = [
            "name",
            "department",
        ]

    def __str__(self):
        return f"{self.name} - {self.department.code}"