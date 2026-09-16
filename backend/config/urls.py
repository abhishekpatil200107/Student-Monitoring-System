from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path("api/auth/", include("accounts.urls")),

    # Students
    path("api/", include("students.urls")),

    # Faculty
    path("api/faculty/", include("faculty.urls")),

    # Departments
    path("api/departments/", include("departments.urls")),

    # Classes
    path("api/classes/", include("classes.urls")),

    # Other APIs
    path("api/attendance/", include("attendance.urls")),
    path("api/subjects/", include("subjects.urls")),
    path("api/classroom/", include("classroom.urls")),
    path("api/", include("diary.urls")),
    path("api/coding/", include("coding.urls")),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )