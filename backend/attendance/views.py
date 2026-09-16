from datetime import timedelta
import hashlib
import hmac
import math
import secrets
import time

from django.db import transaction
from django.db.models import Exists, OuterRef
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Attendance,
    AttendancePermission,
    CRAttendanceAccess,
)

from .serializers import (
    AttendanceSerializer,
    AttendancePermissionSerializer,
    CRAttendanceAccessSerializer,
)

from faculty.models import Faculty
from students.models import Student
from subjects.models import Subject


class AttendanceViewSet(viewsets.ModelViewSet):

    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    # =========================================================
    # ATTENDANCE SECURITY SETTINGS
    # =========================================================

    QR_VALIDITY_SECONDS = 15
    ATTENDANCE_SESSION_MINUTES = 20
    ACCESS_VALIDITY_DAYS = 2
    GEOFENCE_RADIUS_METERS = 50

    # =========================================================
    # FIXED COLLEGE ATTENDANCE LOCATION
    # =========================================================

    COLLEGE_LATITUDE = 18.506108
    COLLEGE_LONGITUDE = 73.802676

    # =========================================================
    # INTERNAL HELPERS
    # =========================================================

    def _get_faculty(self, request):

        if request.user.role != request.user.Role.FACULTY:
            return None, Response(
                {
                    "message": "Only faculty can access this endpoint."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            faculty = request.user.faculty_profile
        except Exception:
            return None, Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return faculty, None

    def _get_student(self, request):

        if request.user.role != request.user.Role.STUDENT:
            return None, Response(
                {
                    "message": "Only students can access this endpoint."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            student = request.user.student_profile
        except Exception:
            return None, Response(
                {
                    "message": "Student profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return student, None

    def _parse_date(self, value):

        try:
            return timezone.datetime.strptime(
                value,
                "%Y-%m-%d",
            ).date()
        except (TypeError, ValueError):
            return None

    def _get_subject_for_faculty(
        self,
        subject_id,
        faculty,
    ):

        try:
            subject = (
                Subject.objects
                .select_related(
                    "class_relation",
                )
                .get(
                    id=subject_id,
                    faculty=faculty,
                )
            )
        except Subject.DoesNotExist:
            return None

        return subject

    def _get_approved_students(self, subject):

        if not subject.class_relation_id:
            return Student.objects.none()

        return (
            Student.objects
            .filter(
                class_relation=subject.class_relation,
                approval_status="APPROVED",
            )
            .order_by("roll_no")
        )

    # =========================================================
    # GEOLOCATION
    # =========================================================

    def _validate_coordinates(
        self,
        latitude,
        longitude,
    ):

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            return None, None

        if not (-90 <= latitude <= 90):
            return None, None

        if not (-180 <= longitude <= 180):
            return None, None

        return latitude, longitude

    def _distance_meters(
        self,
        latitude1,
        longitude1,
        latitude2,
        longitude2,
    ):

        radius = 6371000

        lat1 = math.radians(float(latitude1))
        lat2 = math.radians(float(latitude2))

        delta_lat = math.radians(
            float(latitude2) - float(latitude1)
        )

        delta_lon = math.radians(
            float(longitude2) - float(longitude1)
        )

        a = (
            math.sin(delta_lat / 2) ** 2
            + math.cos(lat1)
            * math.cos(lat2)
            * math.sin(delta_lon / 2) ** 2
        )

        c = 2 * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a),
        )

        return radius * c

    def _check_geofence(
        self,
        access,
        latitude,
        longitude,
    ):

        latitude, longitude = self._validate_coordinates(
            latitude,
            longitude,
        )

        if latitude is None:
            return False, None, (
                "Valid latitude and longitude are required."
            )

        # =====================================================
        # IMPORTANT:
        # Always check against the fixed college location.
        # Never trust the location supplied by the faculty,
        # CR, or attendance session.
        # =====================================================

        distance = self._distance_meters(
            self.COLLEGE_LATITUDE,
            self.COLLEGE_LONGITUDE,
            latitude,
            longitude,
        )

        if distance > self.GEOFENCE_RADIUS_METERS:
            return (
                False,
                distance,
                (
                    "You are outside the 50-meter "
                    "attendance area."
                ),
            )

        return True, distance, None

    # =========================================================
    # QR SECURITY
    # =========================================================

    def _get_qr_version(self):

        return int(
            time.time()
            // self.QR_VALIDITY_SECONDS
        )

    def _generate_qr_signature(
        self,
        access,
        version,
    ):

        secret = access.qr_secret

        if not secret:
            return None

        message = (
            f"{access.id}:"
            f"{version}:"
            f"{access.subject_id}:"
            f"{access.date.isoformat()}"
        )

        digest = hmac.new(
            secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        return digest

    def _refresh_qr(self, access):

        now = timezone.now()

        current_version = self._get_qr_version()

        if (
            access.qr_secret
            and access.qr_version == current_version
            and access.qr_expires_at
            and access.qr_expires_at > now
        ):
            expires_at = access.qr_expires_at

        else:

            if not access.qr_secret:
                access.qr_secret = secrets.token_urlsafe(48)

            access.qr_version = current_version

            expires_at = (
                now
                + timedelta(
                    seconds=self.QR_VALIDITY_SECONDS
                )
            )

            access.qr_expires_at = expires_at

            access.save(
                update_fields=[
                    "qr_secret",
                    "qr_version",
                    "qr_expires_at",
                ]
            )

        signature = self._generate_qr_signature(
            access,
            current_version,
        )

        qr_token = (
            f"ATTENDANCE:"
            f"{access.id}:"
            f"{current_version}:"
            f"{signature}"
        )

        return {
            "token": qr_token,
            "version": current_version,
            "expires_at": expires_at,
            "expires_in": max(
                0,
                int(
                    (
                        expires_at - now
                    ).total_seconds()
                ),
            ),
        }

    def _verify_qr_token(
        self,
        qr_token,
    ):

        if not qr_token:
            return None, (
                "QR token is required."
            )

        parts = qr_token.split(":")

        if len(parts) != 4:
            return None, (
                "Invalid QR token."
            )

        prefix = parts[0]

        if prefix != "ATTENDANCE":
            return None, (
                "Invalid QR token."
            )

        try:
            access_id = int(parts[1])
            version = int(parts[2])
        except (TypeError, ValueError):
            return None, (
                "Invalid QR token."
            )

        supplied_signature = parts[3]

        try:
            access = (
                CRAttendanceAccess.objects
                .select_related(
                    "faculty",
                    "subject",
                    "subject__class_relation",
                )
                .get(
                    id=access_id,
                )
            )
        except CRAttendanceAccess.DoesNotExist:
            return None, (
                "Attendance QR session not found."
            )

        if not access.is_active:
            return None, (
                "This attendance session is no longer active."
            )

        if access.completed_at:
            return None, (
                "This attendance session has already been completed."
            )

        now = timezone.now()

        if (
            access.expires_at
            and access.expires_at <= now
        ):
            access.is_active = False

            access.save(
                update_fields=["is_active"]
            )

            return None, (
                "This attendance access has expired."
            )

        if not access.opened_at:
            return None, (
                "The attendance session has not been opened."
            )

        if (
            not access.session_expires_at
            or access.session_expires_at <= now
        ):
            access.is_active = False

            access.save(
                update_fields=["is_active"]
            )

            return None, (
                "The attendance session has expired."
            )

        current_version = self._get_qr_version()

        if version != current_version:
            return None, (
                "This QR code has expired. "
                "Please scan the latest QR code."
            )

        expected_signature = (
            self._generate_qr_signature(
                access,
                version,
            )
        )

        if not expected_signature:
            return None, (
                "QR security information is missing."
            )

        if not hmac.compare_digest(
            supplied_signature,
            expected_signature,
        ):
            return None, (
                "Invalid QR code."
            )

        qr_info = self._refresh_qr(
            access
        )

        if qr_info["version"] != version:
            return None, (
                "This QR code has expired."
            )

        return access, None

    # =========================================================
    # INTERNAL ATTENDANCE RESPONSE
    # =========================================================

    def _attendance_session_response(
        self,
        access,
    ):

        now = timezone.now()

        remaining_seconds = max(
            0,
            int(
                (
                    access.session_expires_at
                    - now
                ).total_seconds()
            ),
        )

        students = list(
            self._get_approved_students(
                access.subject
            )
        )

        attendance_records = (
            Attendance.objects
            .filter(
                subject=access.subject,
                date=access.date,
                student__in=students,
            )
        )

        attendance_map = {
            record.student_id: record.status
            for record in attendance_records
        }

        student_data = []

        for student in students:

            student_data.append(
                {
                    "student": student.id,
                    "roll_no": student.roll_no,
                    "name": student.name,
                    "department": student.department,
                    "status": attendance_map.get(
                        student.id
                    ),
                }
            )

        qr = self._refresh_qr(
            access
        )

        return {
            "access": {
                "id": access.id,
                "access_type": access.access_type,
                "faculty": access.faculty_id,
                "cr_student": (
                    access.cr_student_id
                ),
                "subject": access.subject_id,
                "subject_name": (
                    access.subject.name
                ),
                "subject_code": (
                    access.subject.code
                ),
                "class": (
                    access.subject.class_relation_id
                ),
                "class_name": (
                    access.subject.class_relation.name
                ),
                "date": access.date,

                # Always return fixed college location
                "latitude": self.COLLEGE_LATITUDE,
                "longitude": self.COLLEGE_LONGITUDE,

                "opened_at": access.opened_at,
                "session_expires_at": (
                    access.session_expires_at
                ),
                "completed_at": access.completed_at,
                "expires_at": access.expires_at,
                "is_active": access.is_active,
                "remaining_seconds": remaining_seconds,
            },
            "qr": qr,
            "students": student_data,
            "total_students": len(student_data),
        }

    # =========================================================
    # STUDENT - MY ATTENDANCE
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="me",
        permission_classes=[IsAuthenticated],
    )
    def me(self, request):

        student, error = self._get_student(
            request
        )

        if error:
            return error

        records = (
            Attendance.objects
            .filter(
                student=student
            )
            .select_related(
                "subject"
            )
            .order_by("-date")
        )

        total = records.count()

        present = records.filter(
            status="Present"
        ).count()

        absent = records.filter(
            status="Absent"
        ).count()

        late = records.filter(
            status="Late"
        ).count()

        percentage = (
            round(
                (present / total) * 100,
                2,
            )
            if total > 0
            else 0
        )

        serializer = self.get_serializer(
            records,
            many=True,
        )

        return Response(
            {
                "student": {
                    "id": student.id,
                    "name": student.name,
                    "roll_no": student.roll_no,
                },
                "statistics": {
                    "total": total,
                    "present": present,
                    "absent": absent,
                    "late": late,
                    "percentage": percentage,
                },
                "records": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # STUDENT - SUBJECT SUMMARY
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="student-summary",
        permission_classes=[IsAuthenticated],
    )
    def student_summary(self, request):

        student, error = self._get_student(
            request
        )

        if error:
            return error

        subjects = (
            Subject.objects
            .filter(
                class_relation=student.class_relation
            )
            .order_by(
                "semester",
                "name",
            )
        )

        summary = []

        overall_total = 0
        overall_present = 0
        overall_absent = 0

        for subject in subjects:

            records = Attendance.objects.filter(
                student=student,
                subject=subject,
            )

            total = records.count()

            present = records.filter(
                status="Present"
            ).count()

            absent = records.filter(
                status="Absent"
            ).count()

            late = records.filter(
                status="Late"
            ).count()

            percentage = (
                round(
                    (present / total) * 100,
                    2,
                )
                if total > 0
                else 0
            )

            overall_total += total
            overall_present += present
            overall_absent += absent

            summary.append(
                {
                    "subject": {
                        "id": subject.id,
                        "code": subject.code,
                        "name": subject.name,
                        "semester": subject.semester,
                    },
                    "total": total,
                    "present": present,
                    "absent": absent,
                    "late": late,
                    "percentage": percentage,
                }
            )

        overall_percentage = (
            round(
                (
                    overall_present
                    / overall_total
                )
                * 100,
                2,
            )
            if overall_total > 0
            else 0
        )

        return Response(
            {
                "subjects": summary,
                "overall": {
                    "total": overall_total,
                    "present": overall_present,
                    "absent": overall_absent,
                    "percentage": overall_percentage,
                },
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - STUDENTS FOR SUBJECT + DATE
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="faculty-students",
        permission_classes=[IsAuthenticated],
    )
    def faculty_students(self, request):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        subject_id = request.query_params.get(
            "subject"
        )

        if not subject_id:
            return Response(
                {
                    "message": "Subject is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = self._get_subject_for_faculty(
            subject_id,
            faculty,
        )

        if not subject:
            return Response(
                {
                    "message": (
                        "Subject not found or "
                        "not assigned to you."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not subject.class_relation_id:
            return Response(
                {
                    "message": (
                        "This subject does not have "
                        "a class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_date = request.query_params.get(
            "date"
        )

        if selected_date:
            selected_date = self._parse_date(
                selected_date
            )

            if selected_date is None:
                return Response(
                    {
                        "message": (
                            "Invalid date format. "
                            "Use YYYY-MM-DD."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            selected_date = timezone.localdate()

        students = self._get_approved_students(
            subject
        )

        attendance_records = (
            Attendance.objects
            .filter(
                subject=subject,
                date=selected_date,
                student__in=students,
            )
        )

        attendance_map = {
            record.student_id: record.status
            for record in attendance_records
        }

        student_data = []

        for student in students:

            student_data.append(
                {
                    "student": student.id,
                    "roll_no": student.roll_no,
                    "name": student.name,
                    "department": student.department,
                    "status": attendance_map.get(
                        student.id
                    ),
                }
            )

        return Response(
            {
                "subject": {
                    "id": subject.id,
                    "code": subject.code,
                    "name": subject.name,
                },
                "class": {
                    "id": subject.class_relation.id,
                    "name": subject.class_relation.name,
                    "year": subject.class_relation.year,
                    "division": (
                        subject.class_relation.division
                    ),
                },
                "date": selected_date,
                "students": student_data,
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - MARK MANUAL ATTENDANCE
    # =========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="mark",
        permission_classes=[IsAuthenticated],
    )
    def mark(self, request):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        student_id = request.data.get(
            "student"
        )

        subject_id = request.data.get(
            "subject"
        )

        selected_date = request.data.get(
            "date"
        )

        attendance_status = request.data.get(
            "status"
        )

        if not all(
            [
                student_id,
                subject_id,
                selected_date,
                attendance_status,
            ]
        ):
            return Response(
                {
                    "message": (
                        "student, subject, date and "
                        "status are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_statuses = {
            "Present",
            "Absent",
        }

        if attendance_status not in allowed_statuses:
            return Response(
                {
                    "message": (
                        "Attendance status must be "
                        "Present or Absent."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_date = self._parse_date(
            selected_date
        )

        if selected_date is None:
            return Response(
                {
                    "message": (
                        "Invalid date format. "
                        "Use YYYY-MM-DD."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()

        if selected_date > today:
            return Response(
                {
                    "message": (
                        "Attendance cannot be marked "
                        "for a future date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = self._get_subject_for_faculty(
            subject_id,
            faculty,
        )

        if not subject:
            return Response(
                {
                    "message": (
                        "Subject not found or "
                        "not assigned to you."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not subject.class_relation_id:
            return Response(
                {
                    "message": (
                        "This subject does not have "
                        "a class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        three_days_ago = (
            today - timedelta(days=3)
        )

        if selected_date < three_days_ago:

            permission_exists = (
                AttendancePermission.objects
                .filter(
                    faculty=faculty,
                    subject=subject,
                    date=selected_date,
                )
                .exists()
            )

            if not permission_exists:
                return Response(
                    {
                        "message": (
                            "Attendance for this date "
                            "requires Admin permission."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        try:
            student = (
                Student.objects
                .get(
                    id=student_id,
                    class_relation=(
                        subject.class_relation
                    ),
                )
            )
        except Student.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Student does not belong "
                        "to this subject's class."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if student.approval_status != "APPROVED":
            return Response(
                {
                    "message": (
                        "Attendance cannot be marked "
                        "for a student who is not approved."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        attendance, created = (
            Attendance.objects.update_or_create(
                student=student,
                subject=subject,
                date=selected_date,
                defaults={
                    "status": attendance_status,
                },
            )
        )

        serializer = self.get_serializer(
            attendance
        )

        return Response(
            {
                "message": (
                    "Attendance marked successfully."
                    if created
                    else "Attendance updated successfully."
                ),
                "attendance": serializer.data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    # =========================================================
    # ADMIN - ATTENDANCE PERMISSIONS
    # =========================================================

    @action(
        detail=False,
        methods=["get", "post"],
        url_path="permissions",
        permission_classes=[IsAuthenticated],
    )
    def permissions(self, request):

        if request.user.role != request.user.Role.ADMIN:
            return Response(
                {
                    "message": (
                        "Only Admin can manage "
                        "attendance permissions."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.method == "GET":

            permissions = (
                AttendancePermission.objects
                .select_related(
                    "faculty",
                    "subject",
                    "subject__class_relation",
                )
                .all()
            )

            serializer = (
                AttendancePermissionSerializer(
                    permissions,
                    many=True,
                )
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        faculty_id = request.data.get(
            "faculty"
        )

        subject_id = request.data.get(
            "subject"
        )

        selected_date = request.data.get(
            "date"
        )

        if not all(
            [
                faculty_id,
                subject_id,
                selected_date,
            ]
        ):
            return Response(
                {
                    "message": (
                        "faculty, subject and "
                        "date are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_date = self._parse_date(
            selected_date
        )

        if selected_date is None:
            return Response(
                {
                    "message": (
                        "Invalid date format. "
                        "Use YYYY-MM-DD."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            faculty = Faculty.objects.get(
                id=faculty_id
            )
        except Faculty.DoesNotExist:
            return Response(
                {
                    "message": "Faculty not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        subject = self._get_subject_for_faculty(
            subject_id,
            faculty,
        )

        if not subject:
            return Response(
                {
                    "message": (
                        "Subject does not exist or "
                        "is not assigned to this faculty."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not subject.class_relation_id:
            return Response(
                {
                    "message": (
                        "This subject does not have "
                        "a class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        permission, created = (
            AttendancePermission.objects.get_or_create(
                faculty=faculty,
                subject=subject,
                date=selected_date,
                defaults={
                    "granted_by": request.user,
                },
            )
        )

        serializer = (
            AttendancePermissionSerializer(
                permission
            )
        )

        return Response(
            {
                "message": (
                    "Attendance permission created."
                    if created
                    else "Attendance permission already exists."
                ),
                "permission": serializer.data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    # =========================================================
    # FACULTY - MY ATTENDANCE PERMISSIONS
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="my-permissions",
        permission_classes=[IsAuthenticated],
    )
    def my_permissions(self, request):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        attendance_exists = Attendance.objects.filter(
            subject=OuterRef("subject"),
            date=OuterRef("date"),
        )

        permissions = (
            AttendancePermission.objects
            .filter(
                faculty=faculty,
            )
            .filter(
                Exists(attendance_exists)
            )
            .select_related(
                "subject",
                "subject__class_relation",
            )
            .order_by("-date")
        )

        serializer = (
            AttendancePermissionSerializer(
                permissions,
                many=True,
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - CREATE CR ATTENDANCE ACCESS
    # =========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="cr-access/create",
        permission_classes=[IsAuthenticated],
    )
    def create_cr_access(self, request):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        subject_id = request.data.get(
            "subject"
        )

        selected_date = request.data.get(
            "date"
        )

        cr_student_id = request.data.get(
            "cr_student"
        )

        if not subject_id or not selected_date:
            return Response(
                {
                    "message": (
                        "Subject and date are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_date = self._parse_date(
            selected_date
        )

        if selected_date is None:
            return Response(
                {
                    "message": (
                        "Invalid date format. "
                        "Use YYYY-MM-DD."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()

        if selected_date > today:
            return Response(
                {
                    "message": (
                        "Attendance cannot be created "
                        "for a future date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = self._get_subject_for_faculty(
            subject_id,
            faculty,
        )

        if not subject:
            return Response(
                {
                    "message": (
                        "Subject not found or "
                        "not assigned to you."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not subject.class_relation_id:
            return Response(
                {
                    "message": (
                        "This subject does not have "
                        "a class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = self._get_approved_students(
            subject
        )

        total_students = students.count()

        if total_students == 0:
            return Response(
                {
                    "message": (
                        "No approved students are "
                        "available for this class."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -----------------------------------------------------
        # Specific CR is required
        # -----------------------------------------------------

        if not cr_student_id:
            return Response(
                {
                    "message": (
                        "A specific CR student is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            cr_student = students.get(
                id=cr_student_id
            )
        except Student.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Selected CR is not an approved "
                        "student in this class."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        marked_students = Attendance.objects.filter(
            subject=subject,
            date=selected_date,
            student__in=students,
        ).count()

        if marked_students >= total_students:
            return Response(
                {
                    "message": (
                        "Attendance has already been "
                        "completed for this subject and date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        existing_access = (
            CRAttendanceAccess.objects
            .filter(
                faculty=faculty,
                subject=subject,
                date=selected_date,
                access_type="CR",
                cr_student=cr_student,
                is_active=True,
            )
            .order_by("-created_at")
            .first()
        )

        if existing_access:

            if existing_access.expires_at > now:

                serializer = (
                    CRAttendanceAccessSerializer(
                        existing_access
                    )
                )

                return Response(
                    {
                        "message": (
                            "An active CR attendance "
                            "access already exists."
                        ),
                        "access": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            existing_access.is_active = False

            existing_access.save(
                update_fields=[
                    "is_active"
                ]
            )

        token = secrets.token_urlsafe(
            48
        )

        expires_at = (
            now
            + timedelta(
                days=self.ACCESS_VALIDITY_DAYS
            )
        )

        # =====================================================
        # FIXED COLLEGE LOCATION
        # =====================================================

        access = (
            CRAttendanceAccess.objects.create(
                access_type="CR",
                faculty=faculty,
                cr_student=cr_student,
                subject=subject,
                date=selected_date,
                token=token,

                # Never use faculty/CR GPS.
                latitude=self.COLLEGE_LATITUDE,
                longitude=self.COLLEGE_LONGITUDE,

                qr_secret=secrets.token_urlsafe(
                    48
                ),
                expires_at=expires_at,
                is_active=True,
            )
        )

        serializer = (
            CRAttendanceAccessSerializer(
                access
            )
        )

        return Response(
            {
                "message": (
                    "CR attendance access created "
                    "successfully."
                ),
                "access": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    # =========================================================
    # FACULTY - MY CR ACCESS
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="my-cr-access",
        permission_classes=[IsAuthenticated],
    )
    def my_cr_access(self, request):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        accesses = (
            CRAttendanceAccess.objects
            .filter(
                faculty=faculty,
                access_type="CR",
            )
            .select_related(
                "faculty",
                "cr_student",
                "subject",
                "subject__class_relation",
            )
            .order_by("-created_at")
        )

        serializer = (
            CRAttendanceAccessSerializer(
                accesses,
                many=True,
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - RESEND / ROTATE CR ACCESS
    # =========================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="resend",
        permission_classes=[IsAuthenticated],
    )
    def resend_cr_access(
        self,
        request,
        pk=None,
    ):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        try:
            access = (
                CRAttendanceAccess.objects
                .select_related(
                    "subject",
                    "subject__class_relation",
                    "cr_student",
                )
                .get(
                    id=pk,
                    faculty=faculty,
                    access_type="CR",
                )
            )
        except CRAttendanceAccess.DoesNotExist:
            return Response(
                {
                    "message": "CR access not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if access.completed_at:
            return Response(
                {
                    "message": (
                        "This attendance session "
                        "has already been completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        access.token = secrets.token_urlsafe(
            48
        )

        access.qr_secret = secrets.token_urlsafe(
            48
        )

        access.qr_version = 0
        access.qr_expires_at = None

        access.expires_at = (
            now
            + timedelta(
                days=self.ACCESS_VALIDITY_DAYS
            )
        )

        access.opened_at = None
        access.session_expires_at = None
        access.completed_at = None
        access.is_active = True

        # Keep fixed college location.
        access.latitude = self.COLLEGE_LATITUDE
        access.longitude = self.COLLEGE_LONGITUDE

        access.save(
            update_fields=[
                "token",
                "qr_secret",
                "qr_version",
                "qr_expires_at",
                "expires_at",
                "opened_at",
                "session_expires_at",
                "completed_at",
                "is_active",
                "latitude",
                "longitude",
            ]
        )

        serializer = (
            CRAttendanceAccessSerializer(
                access
            )
        )

        return Response(
            {
                "message": (
                    "CR attendance access "
                    "regenerated successfully."
                ),
                "access": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # CR - OPEN ATTENDANCE ACCESS
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path=r"cr-access/(?P<token>[^/.]+)/open",
        permission_classes=[IsAuthenticated],
    )
    def open_cr_access(
        self,
        request,
        token=None,
    ):

        student, error = self._get_student(
            request
        )

        if error:
            return error

        try:
            access = (
                CRAttendanceAccess.objects
                .select_related(
                    "faculty",
                    "subject",
                    "subject__class_relation",
                    "cr_student",
                )
                .get(
                    token=token,
                    is_active=True,
                    access_type="CR",
                )
            )
        except CRAttendanceAccess.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Invalid or inactive CR "
                        "attendance link."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            not access.cr_student_id
            or access.cr_student_id != student.id
        ):
            return Response(
                {
                    "message": (
                        "This attendance access is "
                        "not assigned to your account."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()

        if access.expires_at <= now:

            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "This CR attendance link has expired."
                    )
                },
                status=status.HTTP_410_GONE,
            )

        if access.completed_at:

            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "This attendance session "
                        "has already been completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if access.opened_at:

            if (
                access.session_expires_at
                and access.session_expires_at > now
            ):

                return Response(
                    self._attendance_session_response(
                        access
                    ),
                    status=status.HTTP_200_OK,
                )

            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "The attendance session "
                        "has expired."
                    )
                },
                status=status.HTTP_410_GONE,
            )

        access.opened_at = now

        access.session_expires_at = (
            now
            + timedelta(
                minutes=self.ATTENDANCE_SESSION_MINUTES
            )
        )

        access.save(
            update_fields=[
                "opened_at",
                "session_expires_at",
            ]
        )

        return Response(
            self._attendance_session_response(
                access
            ),
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - CREATE QR ATTENDANCE SESSION
    # =========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="faculty-qr/create",
        permission_classes=[IsAuthenticated],
    )
    def create_faculty_qr(
        self,
        request,
    ):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        subject_id = request.data.get(
            "subject"
        )

        selected_date = request.data.get(
            "date"
        )

        if not subject_id or not selected_date:
            return Response(
                {
                    "message": (
                        "Subject and date are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_date = self._parse_date(
            selected_date
        )

        if selected_date is None:
            return Response(
                {
                    "message": (
                        "Invalid date format. "
                        "Use YYYY-MM-DD."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()

        if selected_date > today:
            return Response(
                {
                    "message": (
                        "Attendance cannot be created "
                        "for a future date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = self._get_subject_for_faculty(
            subject_id,
            faculty,
        )

        if not subject:
            return Response(
                {
                    "message": (
                        "Subject not found or "
                        "not assigned to you."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not subject.class_relation_id:
            return Response(
                {
                    "message": (
                        "This subject does not have "
                        "a class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = self._get_approved_students(
            subject
        )

        total_students = students.count()

        if total_students == 0:
            return Response(
                {
                    "message": (
                        "No approved students are "
                        "available for this class."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        marked_students = Attendance.objects.filter(
            subject=subject,
            date=selected_date,
            student__in=students,
        ).count()

        if marked_students >= total_students:
            return Response(
                {
                    "message": (
                        "Attendance has already been "
                        "completed for this subject and date."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        existing_access = (
            CRAttendanceAccess.objects
            .filter(
                faculty=faculty,
                subject=subject,
                date=selected_date,
                access_type="FACULTY",
                is_active=True,
            )
            .order_by("-created_at")
            .first()
        )

        if existing_access:

            if existing_access.expires_at > now:

                response_data = (
                    self._attendance_session_response(
                        existing_access
                    )
                )

                return Response(
                    {
                        "message": (
                            "An active faculty QR "
                            "session already exists."
                        ),
                        **response_data,
                    },
                    status=status.HTTP_200_OK,
                )

            existing_access.is_active = False

            existing_access.save(
                update_fields=[
                    "is_active"
                ]
            )

        # =====================================================
        # FIXED COLLEGE LOCATION
        # =====================================================

        access = (
            CRAttendanceAccess.objects.create(
                access_type="FACULTY",
                faculty=faculty,
                cr_student=None,
                subject=subject,
                date=selected_date,
                token=secrets.token_urlsafe(
                    48
                ),

                # Always use college location.
                latitude=self.COLLEGE_LATITUDE,
                longitude=self.COLLEGE_LONGITUDE,

                qr_secret=secrets.token_urlsafe(
                    48
                ),
                expires_at=(
                    now
                    + timedelta(
                        days=self.ACCESS_VALIDITY_DAYS
                    )
                ),
                opened_at=now,
                session_expires_at=(
                    now
                    + timedelta(
                        minutes=self.ATTENDANCE_SESSION_MINUTES
                    )
                ),
                is_active=True,
            )
        )

        print(
            "CREATED QR SESSION:",
            "id=", access.id,
            "now=", now,
            "opened_at=", access.opened_at,
            "session_expires_at=", access.session_expires_at,
            "expires_at=", access.expires_at,
            "is_active=", access.is_active,
        )

        return Response(
            {
                "message": (
                    "Faculty QR attendance session "
                    "created successfully."
                ),
                **self._attendance_session_response(
                    access
                ),
            },
            status=status.HTTP_201_CREATED,
        )

    # =========================================================
    # FACULTY - MY QR SESSIONS
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="my-qr-sessions",
        permission_classes=[IsAuthenticated],
    )
    def my_qr_sessions(
        self,
        request,
    ):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        accesses = (
            CRAttendanceAccess.objects
            .filter(
                faculty=faculty,
                access_type="FACULTY",
            )
            .select_related(
                "subject",
                "subject__class_relation",
            )
            .order_by("-created_at")
        )

        return Response(
            CRAttendanceAccessSerializer(
                accesses,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - GET CURRENT QR
    # =========================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="qr",
        permission_classes=[IsAuthenticated],
    )
    def get_current_qr(
        self,
        request,
        pk=None,
    ):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        try:
            access = (
                CRAttendanceAccess.objects
                .select_related(
                    "subject",
                    "subject__class_relation",
                )
                .get(
                    id=pk,
                    faculty=faculty,
                )
            )
        except CRAttendanceAccess.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Attendance session not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not access.is_active:
            return Response(
                {
                    "message": (
                        "Attendance session is inactive."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if access.completed_at:
            return Response(
                {
                    "message": (
                        "Attendance session is completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        print(
            "QR SESSION DEBUG:",
            "id=", access.id,
            "now=", now,
            "opened_at=", access.opened_at,
            "session_expires_at=", access.session_expires_at,
            "expires_at=", access.expires_at,
            "is_active=", access.is_active,
            "completed_at=", access.completed_at,
        )

        if (
            not access.session_expires_at
            or access.session_expires_at <= now
        ):
            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "Attendance session has expired."
                    )
                },
                status=status.HTTP_410_GONE,
            )

        return Response(
            self._attendance_session_response(
                access
            ),
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # FACULTY - COMPLETE QR SESSION
    # =========================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="complete-qr",
        permission_classes=[IsAuthenticated],
    )
    def complete_qr_session(
        self,
        request,
        pk=None,
    ):

        faculty, error = self._get_faculty(
            request
        )

        if error:
            return error

        try:
            access = (
                CRAttendanceAccess.objects
                .get(
                    id=pk,
                    faculty=faculty,
                )
            )
        except CRAttendanceAccess.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Attendance session not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        access.is_active = False

        if not access.completed_at:
            access.completed_at = timezone.now()

        access.save(
            update_fields=[
                "is_active",
                "completed_at",
            ]
        )

        return Response(
            {
                "message": (
                    "Attendance session completed "
                    "successfully."
                ),
                "completed_at": access.completed_at,
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # STUDENT - SCAN ROTATING QR
    # =========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="qr-scan",
        permission_classes=[IsAuthenticated],
    )
    def qr_scan(
        self,
        request,
    ):

        student, error = self._get_student(
            request
        )

        if error:
            return error

        if student.approval_status != "APPROVED":
            return Response(
                {
                    "message": (
                        "Your account is not approved "
                        "for attendance."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        qr_token = request.data.get(
            "qr_token"
        )

        latitude = request.data.get(
            "latitude"
        )

        longitude = request.data.get(
            "longitude"
        )

        access, qr_error = (
            self._verify_qr_token(
                qr_token
            )
        )

        if qr_error:
            return Response(
                {
                    "message": qr_error
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = access.subject

        if not subject.class_relation_id:
            return Response(
                {
                    "message": (
                        "This attendance session "
                        "has no class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            student.class_relation_id
            != subject.class_relation_id
        ):
            return Response(
                {
                    "message": (
                        "You are not a member of "
                        "this attendance class."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # FIXED COLLEGE GEOFENCE
        # =====================================================

        inside_geofence, distance, location_error = (
            self._check_geofence(
                access,
                latitude,
                longitude,
            )
        )

        if not inside_geofence:
            return Response(
                {
                    "message": location_error,
                    "distance_meters": (
                        round(distance, 2)
                        if distance is not None
                        else None
                    ),
                    "allowed_radius_meters": (
                        self.GEOFENCE_RADIUS_METERS
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        existing = Attendance.objects.filter(
            student=student,
            subject=subject,
            date=access.date,
        ).first()

        if existing:
            return Response(
                {
                    "message": (
                        "Attendance has already been "
                        "marked for you for this subject "
                        "and date."
                    ),
                    "attendance": (
                        AttendanceSerializer(
                            existing
                        ).data
                    ),
                },
                status=status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():

            attendance = (
                Attendance.objects.create(
                    student=student,
                    subject=subject,
                    date=access.date,
                    status="Present",
                )
            )

        total_students = (
            self._get_approved_students(
                subject
            ).count()
        )

        marked_students = (
            Attendance.objects
            .filter(
                subject=subject,
                date=access.date,
                student__in=(
                    self._get_approved_students(
                        subject
                    )
                ),
            )
            .count()
        )

        session_completed = (
            marked_students
            >= total_students
            and total_students > 0
        )

        if session_completed:

            access.completed_at = (
                timezone.now()
            )

            access.is_active = False

            access.save(
                update_fields=[
                    "completed_at",
                    "is_active",
                ]
            )

        return Response(
            {
                "message": (
                    "Attendance marked successfully."
                ),
                "attendance": (
                    AttendanceSerializer(
                        attendance
                    ).data
                ),
                "distance_meters": round(
                    distance,
                    2,
                ),
                "session_completed": (
                    session_completed
                ),
            },
            status=status.HTTP_201_CREATED,
        )

    # =========================================================
    # CR - SUBMIT ATTENDANCE
    # =========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path=r"cr-access/(?P<token>[^/.]+)/submit",
        permission_classes=[IsAuthenticated],
    )
    def submit_cr_attendance(
        self,
        request,
        token=None,
    ):

        student, error = self._get_student(
            request
        )

        if error:
            return error

        try:
            access = (
                CRAttendanceAccess.objects
                .select_related(
                    "faculty",
                    "subject",
                    "subject__class_relation",
                    "cr_student",
                )
                .get(
                    token=token,
                    is_active=True,
                    access_type="CR",
                )
            )
        except CRAttendanceAccess.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Invalid or inactive CR "
                        "attendance link."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            not access.cr_student_id
            or access.cr_student_id != student.id
        ):
            return Response(
                {
                    "message": (
                        "You are not authorized to "
                        "use this CR attendance access."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()

        if access.expires_at <= now:

            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "This CR attendance link has expired."
                    )
                },
                status=status.HTTP_410_GONE,
            )

        if access.completed_at:

            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "This attendance session "
                        "has already been completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not access.opened_at:
            return Response(
                {
                    "message": (
                        "Attendance session has "
                        "not been opened."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not access.session_expires_at
            or access.session_expires_at <= now
        ):

            access.is_active = False

            access.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                {
                    "message": (
                        "The attendance session has expired."
                    )
                },
                status=status.HTTP_410_GONE,
            )

        attendance_list = request.data.get(
            "attendance"
        )

        if (
            not isinstance(
                attendance_list,
                list,
            )
            or not attendance_list
        ):
            return Response(
                {
                    "message": (
                        "Attendance list is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = list(
            self._get_approved_students(
                access.subject
            )
        )

        student_map = {
            student.id: student
            for student in students
        }

        allowed_statuses = {
            "Present",
            "Absent",
        }

        received_students = set()

        validated_attendance = []

        for item in attendance_list:

            if not isinstance(
                item,
                dict,
            ):
                return Response(
                    {
                        "message": (
                            "Invalid attendance data."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            student_id = item.get(
                "student"
            )

            attendance_status = item.get(
                "status"
            )

            if (
                student_id is None
                or attendance_status is None
            ):
                return Response(
                    {
                        "message": (
                            "Each attendance record "
                            "requires student and status."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                student_id = int(
                    student_id
                )
            except (
                TypeError,
                ValueError,
            ):
                return Response(
                    {
                        "message": (
                            "Invalid student ID."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if student_id in received_students:
                return Response(
                    {
                        "message": (
                            "Duplicate student found "
                            "in attendance."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if attendance_status not in allowed_statuses:
                return Response(
                    {
                        "message": (
                            "Attendance status must be "
                            "Present or Absent."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if student_id not in student_map:
                return Response(
                    {
                        "message": (
                            "Student is not eligible "
                            "for this attendance session."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            received_students.add(
                student_id
            )

            validated_attendance.append(
                {
                    "student": student_map[
                        student_id
                    ],
                    "status": attendance_status,
                }
            )

        expected_students = set(
            student_map.keys()
        )

        if received_students != expected_students:

            missing_students = (
                expected_students
                - received_students
            )

            return Response(
                {
                    "message": (
                        "Attendance must be submitted "
                        "for every approved student."
                    ),
                    "missing_students": list(
                        missing_students
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            for item in validated_attendance:

                Attendance.objects.update_or_create(
                    student=item["student"],
                    subject=access.subject,
                    date=access.date,
                    defaults={
                        "status": item["status"],
                    },
                )

            access.completed_at = now
            access.is_active = False

            access.save(
                update_fields=[
                    "completed_at",
                    "is_active",
                ]
            )

        return Response(
            {
                "message": (
                    "Attendance submitted successfully."
                ),
                "completed_at": access.completed_at,
            },
            status=status.HTTP_200_OK,
        )