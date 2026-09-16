from django.conf import settings
from django.db import models

from classes.models import Class
from departments.models import Department

class Student(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
        null=True,
        blank=True,
    )

    department_relation = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )

    class_relation = models.ForeignKey(
        Class,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )

    APPROVAL_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default="PENDING",
    )

    approved_by = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_students",
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    YEAR_CHOICES = [
        ("FY", "First Year"),
        ("SY", "Second Year"),
        ("TY", "Third Year"),
        ("LY", "Last Year"),
    ]

    DIVISION_CHOICES = [
        ("A", "Division A"),
        ("B", "Division B"),
        ("C", "Division C"),
    ]

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    roll_no = models.CharField(
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

    year = models.CharField(
        max_length=10,
        choices=YEAR_CHOICES,
    )

    division = models.CharField(
        max_length=5,
        choices=DIVISION_CHOICES,
        default="A",
    )

    attendance = models.PositiveIntegerField(
        default=0,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active",
    )

    profile = models.ImageField(
        upload_to="students/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["roll_no"]

    def __str__(self):
        return f"{self.roll_no} - {self.name}"