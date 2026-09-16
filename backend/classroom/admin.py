from django.contrib import admin

from .models import Lecture, LectureStudentActivity


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = (
        "subject",
        "faculty",
        "topic",
        "status",
        "lecture_date",
    )

    list_filter = (
        "status",
        "department",
        "year",
    )

    search_fields = (
        "topic",
        "subject__name",
    )


@admin.register(LectureStudentActivity)
class LectureStudentActivityAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "lecture",
        "attendance",
        "participation_score",
    )

    list_filter = (
        "attendance",
    )

    search_fields = (
        "student__name",
    )