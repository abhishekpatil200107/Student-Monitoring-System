from django.contrib import admin

from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):

    list_display = [
        "student",
        "date",
        "status",
        "created_at",
    ]

    list_filter = [
        "status",
        "date",
    ]

    search_fields = [
        "student__name",
        "student__roll_no",
        "student__email",
    ]

    ordering = [
        "-date",
    ]

