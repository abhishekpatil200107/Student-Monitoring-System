from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    LoginAPIView,
    StudentRegistrationAPIView,
    FacultyInvitationAPIView,
    FacultyVerifyOTPAPIView,
)


urlpatterns = [

    path(
        "login/",
        LoginAPIView.as_view(),
        name="login",
    ),

    path(
        "student/register/",
        StudentRegistrationAPIView.as_view(),
        name="student-register",
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    path(
        "faculty/invite/",
        FacultyInvitationAPIView.as_view(),
    ),

    path(
        "faculty/verify-otp/",
        FacultyVerifyOTPAPIView.as_view(),
    ),
]