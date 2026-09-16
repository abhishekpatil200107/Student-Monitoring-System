from django.conf import settings
from django.db import models

from classes.models import Class
from departments.models import Department
from students.models import Student


class Faculty(models.Model):

    DESIGNATIONS = [
        ("Professor", "Professor"),
        ("Associate Professor", "Associate Professor"),
        ("Assistant Professor", "Assistant Professor"),
        ("Lecturer", "Lecturer"),
    ]

    STATUS = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_profile",
        null=True,
        blank=True,
    )

    department_relation = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="faculty_members",
    )

    assigned_classes = models.ManyToManyField(
        Class,
        blank=True,
        related_name="faculty_members",
    )

    employee_id = models.CharField(
        max_length=20,
        unique=True,
    )

    name = models.CharField(
        max_length=120,
    )

    email = models.EmailField(
        unique=True,
    )

    phone = models.CharField(
        max_length=15,
    )

    department = models.CharField(
        max_length=100,
    )

    designation = models.CharField(
        max_length=50,
        choices=DESIGNATIONS,
    )

    qualification = models.CharField(
        max_length=100,
    )

    experience = models.PositiveIntegerField(
        default=0,
    )

    joining_date = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Active",
    )

    profile = models.ImageField(
        upload_to="faculty/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.name

