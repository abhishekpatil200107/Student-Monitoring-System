from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Faculty
from .serializers import FacultySerializer

from students.models import Student
from students.serializers import StudentSerializer

from attendance.models import Attendance


class FacultyViewSet(viewsets.ModelViewSet):

    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    permission_classes = [
        IsAuthenticated,
    ]

    # -------------------------------------------------
    # Faculty's pending students
    # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="pending-students",
        permission_classes=[IsAuthenticated],
    )
    def pending_students(self, request):

        # Make sure logged-in user is a faculty member
        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can view pending students."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            faculty = request.user.faculty_profile

        except Faculty.DoesNotExist:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Students belonging to classes assigned to this faculty
        students = Student.objects.filter(
            class_relation__in=faculty.assigned_classes.all(),
            approval_status="PENDING",
        ).select_related(
            "department_relation",
            "class_relation",
        )

        serializer = StudentSerializer(
            students,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # -------------------------------------------------
    # Faculty's students
    # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="students",
        permission_classes=[IsAuthenticated],
    )
    def students(self, request):

        # Make sure logged-in user is a faculty member
        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can view students."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            faculty = request.user.faculty_profile

        except Faculty.DoesNotExist:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Students belonging to classes assigned
        # to this faculty
        students = Student.objects.filter(
            class_relation__in=faculty.assigned_classes.all(),
            approval_status="APPROVED",
        ).select_related(
            "department_relation",
            "class_relation",
        )

        serializer = StudentSerializer(
            students,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


   
    # -------------------------------------------------
    # Approve Student
    # -------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="approve-student",
        permission_classes=[IsAuthenticated],
    )
    def approve_student(self, request, pk=None):

        # -----------------------------------------
        # Make sure logged-in user is faculty
        # -----------------------------------------

        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can approve students."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------
        # Get faculty profile
        # -----------------------------------------

        try:
 
            faculty = request.user.faculty_profile

        except Faculty.DoesNotExist:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------
        # Get pending student
        # -----------------------------------------

        try:
  
            student = Student.objects.get(
                id=pk,
                approval_status="PENDING",
            )

        except Student.DoesNotExist:

            return Response(
                {
                    "message": "Pending student not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------
        # Authorization check
        # -----------------------------------------

        if not faculty.assigned_classes.filter(
            id=student.class_relation_id
        ).exists():

            return Response(
                {
                    "message": (
                        "You are not authorized to approve "
                        "this student."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------
        # Approve student
        # -----------------------------------------

        student.approval_status = "APPROVED"
        student.approved_by = faculty
        student.approved_at = timezone.now()

        student.save(
            update_fields=[
                "approval_status",
                "approved_by",
                "approved_at",
                "updated_at",
            ]
        )

        # -----------------------------------------
        # Activate student's login account
        # -----------------------------------------

        if student.user:
 
            student.user.account_status = (
                student.user.AccountStatus.ACTIVE
            )

            student.user.save(
                update_fields=[
                    "account_status",
                    "updated_at",
                ]
            )

        # -----------------------------------------
        # Success response
        # -----------------------------------------

        return Response(
            {
                "message": "Student approved successfully.",
                "student_id": student.id,
                "approval_status": student.approval_status,
                "account_status": student.user.account_status,
            },
            status=status.HTTP_200_OK,
        )



    # -------------------------------------------------
    # Reject Student
    # -------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="reject-student",
        permission_classes=[IsAuthenticated],
    )
    def reject_student(self, request, pk=None):

        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can reject students."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            faculty = request.user.faculty_profile

        except Faculty.DoesNotExist:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:

            student = Student.objects.get(
                id=pk,
                approval_status="PENDING",
            )

        except Student.DoesNotExist:

            return Response(
                {
                    "message": "Pending student not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Authorization check

        if not faculty.assigned_classes.filter(
            id=student.class_relation_id
        ).exists():

            return Response(
                {
                    "message": (
                        "You are not authorized to reject "
                        "this student."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        student.approval_status = "REJECTED"
        student.approved_by = faculty
        student.approved_at = timezone.now()

        student.save(
            update_fields=[
                "approval_status",
                "approved_by",
                "approved_at",
                "updated_at",
            ]
        )

        # Block student's login account
        if student.user:
            student.user.account_status = (
                student.user.AccountStatus.REJECTED
            )

            student.user.save(
                update_fields=[
                    "account_status",
                    "updated_at",
                ]
            )

        return Response(
            {
                "message": "Student rejected successfully.",
                "student_id": student.id,
                "approval_status": student.approval_status,
            },
            status=status.HTTP_200_OK,
        )

        # -------------------------------------------------
    # Faculty Attendance - Students
    # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="attendance/students",
        permission_classes=[IsAuthenticated],
    )
    def attendance_students(self, request):

        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can access attendance."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            faculty = request.user.faculty_profile

        except Faculty.DoesNotExist:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        students = Student.objects.filter(
            class_relation__in=faculty.assigned_classes.all(),
            approval_status="APPROVED",
        ).select_related(
            "department_relation",
            "class_relation",
        )

        serializer = StudentSerializer(
            students,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # -------------------------------------------------
    # Faculty Mark Attendance
    # -------------------------------------------------

    @action(
        detail=False,
        methods=["post"],
        url_path="attendance/mark",
        permission_classes=[IsAuthenticated],
    )
    def mark_attendance(self, request):

        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can mark attendance."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            faculty = request.user.faculty_profile

        except Faculty.DoesNotExist:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        student_id = request.data.get("student")
        attendance_date = request.data.get("date")
        attendance_status = request.data.get("status")

        if not student_id:

            return Response(
                {
                    "message": "Student is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not attendance_date:

            attendance_date = timezone.localdate()

        if attendance_status not in [
            "Present",
            "Absent",
            "Late",
        ]:

            return Response(
                {
                    "message": "Invalid attendance status."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            student = Student.objects.get(
                id=student_id,
                approval_status="APPROVED",
            )

        except Student.DoesNotExist:

            return Response(
                {
                    "message": "Approved student not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not faculty.assigned_classes.filter(
            id=student.class_relation_id
        ).exists():

            return Response(
                {
                    "message": (
                        "You are not authorized to mark "
                        "attendance for this student."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        attendance, created = Attendance.objects.update_or_create(
            student=student,
            date=attendance_date,
            defaults={
                "status": attendance_status,
            },
        )

        return Response(
            {
                "message": (
                    "Attendance marked successfully."
                    if created
                    else "Attendance updated successfully."
                ),
                "attendance_id": attendance.id,
                "student": student.name,
                "date": attendance.date,
                "status": attendance.status,
            },
            status=status.HTTP_200_OK,
        )