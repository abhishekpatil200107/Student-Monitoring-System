from django.contrib.auth import authenticate

from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework import status
from students.models import Student

from rest_framework_simplejwt.tokens import RefreshToken

import random

from django.utils import timezone
from datetime import timedelta

from .models import User
from .serializers import UserSerializer, StudentRegistrationSerializer


class LoginAPIView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        # ---------------------------------
        # Validate login
        # ---------------------------------

        user = authenticate(
            username=username,
            password=password,
        )

        if not user:
            return Response(
                {
                    "message": "Invalid username or password."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ---------------------------------
        # Student account check
        # ---------------------------------

        if user.role == User.Role.STUDENT:

            try:
                student = user.student_profile
            except Exception:
                return Response(
                    {
                        "message": "Student profile not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Student approval is controlled by
            # the Student profile.

            if student.approval_status == "PENDING":
                return Response(
                    {
                        "message": (
                            "Your registration is pending "
                            "faculty approval."
                        ),
                        "approval_status": "PENDING",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if student.approval_status == "REJECTED":
                return Response(
                    {
                        "message": (
                            "Your registration has been rejected."
                        ),
                        "approval_status": "REJECTED",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Student must also have an active account.

            if user.account_status != User.AccountStatus.ACTIVE:
                return Response(
                    {
                        "message": (
                            "Your student account is not active."
                        ),
                        "account_status": user.account_status,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ---------------------------------
        # Faculty account check
        # ---------------------------------

        if user.role == User.Role.FACULTY:

            if user.account_status == User.AccountStatus.INVITED:
                return Response(
                    {
                        "message": (
                            "Your faculty account has been invited. "
                            "Please complete your registration."
                        ),
                        "account_status": "INVITED",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if user.account_status == User.AccountStatus.PENDING:
                return Response(
                    {
                        "message": (
                            "Your faculty account is pending activation."
                        ),
                        "account_status": "PENDING",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if user.account_status == User.AccountStatus.REJECTED:
                return Response(
                    {
                        "message": (
                            "Your faculty account has been rejected."
                        ),
                        "account_status": "REJECTED",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ---------------------------------
        # Admin account check
        # ---------------------------------

        if user.role == User.Role.ADMIN:

            if not user.is_active:
                return Response(
                    {
                        "message": "Your admin account is inactive."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # ---------------------------------
        # Login successful
        # ---------------------------------

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )




# =================================================
# STUDENT REGISTRATION
# =================================================

class StudentRegistrationAPIView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = StudentRegistrationSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = serializer.save()

        return Response(
            {
                "message": (
                    "Registration successful. "
                    "Your account is waiting for faculty approval."
                ),
                "student_id": student.id,
                "approval_status": "PENDING",
            },
            status=status.HTTP_201_CREATED,
        )

# =================================================
# FACULTY INVITATION / OTP
# =================================================

class FacultyInvitationAPIView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email")

        if not email:
            return Response(
                {
                    "message": "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(
                email=email,
                role=User.Role.FACULTY,
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Faculty account not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------
        # Check faculty account status
        # -----------------------------------------

        if user.account_status == User.AccountStatus.ACTIVE:

            return Response(
                {
                    "message": "Faculty account is already active."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -----------------------------------------
        # Generate OTP
        # -----------------------------------------

        otp = str(
            random.randint(100000, 999999)
        )

        user.invitation_otp = otp
        user.invitation_otp_created_at = timezone.now()

        user.account_status = (
            User.AccountStatus.INVITED
        )

        user.save(
            update_fields=[
                "invitation_otp",
                "invitation_otp_created_at",
                "account_status",
                "updated_at",
            ]
        )

        # -----------------------------------------
        # Development response
        # -----------------------------------------

        return Response(
            {
                "message": (
                    "Faculty invitation OTP generated."
                ),
                "email": user.email,
                "otp": otp,
            },
            status=status.HTTP_200_OK,
        )

# =================================================
# FACULTY VERIFY OTP
# =================================================

class FacultyVerifyOTPAPIView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email")
        otp = request.data.get("otp")
        password = request.data.get("password")

        # ---------------------------------
        # Validate input
        # ---------------------------------

        if not email:
            return Response(
                {
                    "message": "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp:
            return Response(
                {
                    "message": "OTP is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password:
            return Response(
                {
                    "message": "Password is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 6:
            return Response(
                {
                    "message": "Password must be at least 6 characters."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------
        # Find faculty
        # ---------------------------------

        try:

            user = User.objects.get(
                email=email,
                role=User.Role.FACULTY,
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Faculty account not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ---------------------------------
        # Check account status
        # ---------------------------------

        if user.account_status != User.AccountStatus.INVITED:

            return Response(
                {
                    "message": (
                        "This faculty account is not awaiting invitation verification."
                    ),
                    "account_status": user.account_status,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------
        # Check OTP
        # ---------------------------------

        if user.invitation_otp != otp:

            return Response(
                {
                    "message": "Invalid OTP."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------
        # Set password
        # ---------------------------------

        user.set_password(password)

        # ---------------------------------
        # Activate faculty
        # ---------------------------------

        user.account_status = User.AccountStatus.ACTIVE

        # OTP should not be reusable
        user.invitation_otp = None
        user.invitation_otp_created_at = None

        user.save()

        # ---------------------------------
        # Generate login tokens
        # ---------------------------------

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": (
                    "Faculty registration completed successfully."
                ),
                "account_status": user.account_status,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )