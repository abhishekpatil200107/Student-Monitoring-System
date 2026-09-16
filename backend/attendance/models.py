from django.db import models

from students.models import Student
from subjects.models import Subject


class Attendance(models.Model):

    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Absent", "Absent"),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Present",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "subject",
                    "date",
                ],
                name="unique_student_subject_attendance_per_day",
            )
        ]

    def __str__(self):
        return (
            f"{self.student.name} - "
            f"{self.subject.name} - "
            f"{self.date} - "
            f"{self.status}"
        )


class AttendancePermission(models.Model):

    faculty = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.CASCADE,
        related_name="attendance_permissions",
    )

    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.CASCADE,
        related_name="attendance_permissions",
    )

    date = models.DateField()

    granted_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_attendance_permissions",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "faculty",
                    "subject",
                    "date",
                ],
                name="unique_faculty_subject_attendance_permission",
            )
        ]

    def __str__(self):
        return (
            f"{self.faculty.name} - "
            f"{self.subject.name} - "
            f"{self.date}"
        )


class CRAttendanceAccess(models.Model):
    ACCESS_TYPE_CHOICES = [
        ("FACULTY", "Faculty"),
        ("CR", "CR"),
    ]

    access_type = models.CharField(
        max_length=10,
        choices=ACCESS_TYPE_CHOICES,
        default="CR",
    )

    # =========================================================
    # FACULTY
    # =========================================================

    faculty = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.CASCADE,
        related_name="cr_attendance_accesses",
    )

    # =========================================================
    # SPECIFIC CR
    # =========================================================

    cr_student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="cr_attendance_accesses",
    )

    # =========================================================
    # SUBJECT
    # =========================================================

    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.CASCADE,
        related_name="cr_attendance_accesses",
    )

    date = models.DateField()

    # =========================================================
    # CR ACCESS TOKEN
    # =========================================================

    token = models.CharField(
        max_length=128,
        unique=True,
    )

    # =========================================================
    # ATTENDANCE LOCATION
    # =========================================================

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )

    # =========================================================
    # ROTATING QR SECRET
    # =========================================================

    qr_secret = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )

    # Current QR validity window.
    qr_expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # Useful for tracking QR rotations.
    qr_version = models.PositiveIntegerField(
        default=0,
    )

    # =========================================================
    # CREATION
    # =========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # =========================================================
    # LINK EXPIRATION
    #
    # CR access link remains valid for 2 days.
    # =========================================================

    expires_at = models.DateTimeField()

    # =========================================================
    # SESSION
    #
    # Filled when CR opens the attendance link.
    # =========================================================

    opened_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # 20-minute attendance session.
    session_expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # =========================================================
    # COMPLETION
    # =========================================================

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # =========================================================
    # ACTIVE STATE
    # =========================================================

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        cr_name = (
            self.cr_student.name
            if self.cr_student
            else "Unassigned CR"
        )

        return (
            f"CR Access - "
            f"{self.subject.name} - "
            f"{self.date} - "
            f"{cr_name}"
        )