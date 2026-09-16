from django.db import transaction

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User

from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):

    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def create(self, request, *args, **kwargs):

        data = request.data

        username = data.get("username")
        password = data.get("password")

        # -------------------------
        # Validate login details
        # -------------------------

        if not username:
            return Response(
                {
                    "message": "Username is required."
                },
                status=400,
            )

        if not password:
            return Response(
                {
                    "message": "Password is required."
                },
                status=400,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {
                    "message": "Username already exists."
                },
                status=400,
            )

        if User.objects.filter(email=data.get("email")).exists():
            return Response(
                {
                    "message": "Email is already registered."
                },
                status=400,
            )

        # -------------------------
        # Create User + Student
        # -------------------------

        try:

            with transaction.atomic():

                user = User.objects.create_user(
                    username=username,
                    email=data.get("email"),
                    password=password,
                    role=User.Role.STUDENT,
                    account_status=User.AccountStatus.PENDING,
                    phone=data.get("phone", ""),
                )

                student = Student.objects.create(
                    user=user,
                    roll_no=data.get("roll_no"),
                    name=data.get("name"),
                    email=data.get("email"),
                    phone=data.get("phone", ""),
                    department=data.get("department"),
                    year=data.get("year"),
                    division=data.get("division", "A"),
                    attendance=0,
                    status="Active",
                )

            serializer = self.get_serializer(student)

            return Response(
                serializer.data,
                status=201,
            )

        except Exception as e:

            return Response(
                {
                    "message": str(e)
                },
                status=400,
            )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="me",
    )
    def me(self, request):

        try:

            student = Student.objects.get(
                user=request.user
            )

        except Student.DoesNotExist:

            return Response(
                {
                    "message": "Student profile not found."
                },
                status=404,
            )

        serializer = self.get_serializer(student)

        return Response(serializer.data)

    # -------------------------------------------------
    # Student Dashboard
    # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="dashboard",
    )
    def dashboard(self, request):

        # Make sure logged-in user is a student
        if request.user.role != User.Role.STUDENT:
            return Response(
                {
                    "message": "Only students can view the dashboard."
                },
                status=403,
            )

        try:
            student = Student.objects.select_related(
                "department_relation",
                "class_relation",
            ).get(
                user=request.user
            )

        except Student.DoesNotExist:
            return Response(
                {
                    "message": "Student profile not found."
                },
                status=404,
            )

        return Response(
            {
                "student": {
                    "id": student.id,
                    "name": student.name,
                    "email": student.email,
                    "roll_no": student.roll_no,
                    "phone": student.phone,
                    "department": student.department,
                    "year": student.year,
                    "division": student.division,
                    "attendance": student.attendance,
                    "status": student.status,
                    "approval_status": student.approval_status,
                    "class_name": (
                        student.class_relation.name
                        if student.class_relation
                        else None
                    ),
                },

                "statistics": {
                    "attendance": student.attendance,
                    "assignments": 0,
                    "performance": 0,
                    "pending_tasks": 0,
                },
            },
            status=200,
        )