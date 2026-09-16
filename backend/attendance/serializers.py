from rest_framework import serializers

from .models import (
    Attendance,
    AttendancePermission,
    CRAttendanceAccess,
)


# =========================================================
# ATTENDANCE
# =========================================================

class AttendanceSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.name",
        read_only=True,
    )

    department = serializers.CharField(
        source="student.department",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    subject_code = serializers.CharField(
        source="subject.code",
        read_only=True,
    )

    class Meta:
        model = Attendance

        fields = [
            "id",
            "student",
            "student_name",
            "department",

            "subject",
            "subject_name",
            "subject_code",

            "date",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "created_at",
        ]


# =========================================================
# ATTENDANCE PERMISSION
# =========================================================

class AttendancePermissionSerializer(serializers.ModelSerializer):

    faculty_name = serializers.CharField(
        source="faculty.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    subject_code = serializers.CharField(
        source="subject.code",
        read_only=True,
    )

    granted_by_name = serializers.CharField(
        source="granted_by.username",
        read_only=True,
    )

    class Meta:
        model = AttendancePermission

        fields = [
            "id",

            "faculty",
            "faculty_name",

            "subject",
            "subject_name",
            "subject_code",

            "date",

            "granted_by",
            "granted_by_name",

            "created_at",
        ]

        read_only_fields = [
            "granted_by",
            "created_at",
        ]


# =========================================================
# CR ATTENDANCE ACCESS
# =========================================================

class CRAttendanceAccessSerializer(serializers.ModelSerializer):

    faculty_name = serializers.CharField(
        source="faculty.name",
        read_only=True,
    )

    # -----------------------------------------------------
    # CR information
    # -----------------------------------------------------

    cr_student_name = serializers.CharField(
        source="cr_student.name",
        read_only=True,
        allow_null=True,
    )

    cr_student_roll_no = serializers.CharField(
        source="cr_student.roll_no",
        read_only=True,
        allow_null=True,
    )

    # -----------------------------------------------------
    # Subject information
    # -----------------------------------------------------

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    subject_code = serializers.CharField(
        source="subject.code",
        read_only=True,
    )

    # -----------------------------------------------------
    # Class information
    # -----------------------------------------------------

    class_name = serializers.CharField(
        source="subject.class_relation.name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = CRAttendanceAccess

        fields = [
            "id",

            # Faculty
            "faculty",
            "faculty_name",

            # CR
            "cr_student",
            "cr_student_name",
            "cr_student_roll_no",

            # Subject
            "subject",
            "subject_name",
            "subject_code",

            # Class
            "class_name",

            # Date
            "date",

            # Access token
            "token",

            # Location
            "latitude",
            "longitude",

            # QR
            "qr_secret",
            "qr_expires_at",
            "qr_version",

            # Creation / expiration
            "created_at",
            "expires_at",

            # Session
            "opened_at",
            "session_expires_at",

            # Completion
            "completed_at",

            # State
            "is_active",
        ]

        read_only_fields = [
            "token",

            "qr_secret",
            "qr_expires_at",
            "qr_version",

            "created_at",
            "expires_at",

            "opened_at",
            "session_expires_at",

            "completed_at",

            "is_active",
        ]