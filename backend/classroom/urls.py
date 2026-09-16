from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    LectureViewSet,
    LectureStudentActivityViewSet,
    classroom_dashboard,
    attendance_analytics,
    download_pdf,
    performance_dashboard,
    student_report,
    student_report_pdf,
)

router = DefaultRouter()

router.register(
    "lectures",
    LectureViewSet,
    basename="lectures",
)

router.register(
    "activities",
    LectureStudentActivityViewSet,
    basename="activities",
)

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", classroom_dashboard),
    path("attendance/", attendance_analytics),
    path("performance/", performance_dashboard),
    path("lectures/<int:pk>/pdf/", download_pdf, name="lecture-pdf"),
    path("student-report/<int:student_id>/", student_report),
    path("student-report/<int:student_id>/pdf/", student_report_pdf,),
]