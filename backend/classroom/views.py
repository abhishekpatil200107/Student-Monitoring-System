from django.db.models import Avg
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from students.models import Student
from .models import Lecture, LectureStudentActivity
from .serializers import (
    LectureSerializer,
    LectureStudentActivitySerializer,
)
from django.http import HttpResponse

from collections import defaultdict

from reportlab.lib import colors

from reportlab.lib.styles import getSampleStyleSheet

from reportlab.lib.units import inch

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer

    @action(detail=False, methods=["post"])
    def start_lecture(self, request):

        data = request.data

        # Close any previously running lecture
        Lecture.objects.filter(
            status="Running"
        ).update(
            status="Completed"
        )

        lecture = Lecture.objects.create(
            subject_id=data["subject"],
            faculty_id=data["faculty"],
            topic=data["topic"],
            department=data["department"],
            year=data["year"],
            division=data["division"],
            status="Running",
        )

        students = Student.objects.filter(
            department=data["department"],
            year=data["year"],
            division=data["division"],
            status="Active",
        )

        activities = []

        for student in students:
            activities.append(
                LectureStudentActivity(
                    lecture=lecture,
                    student=student,
                )
            )

        LectureStudentActivity.objects.bulk_create(activities)

        return Response(
            {
                "message": "Lecture started successfully",
                "lecture_id": lecture.id,
                "students_loaded": len(activities),
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="active")
    def active(self, request):

        lecture = (
            self.get_queryset()
            .filter(status="Running")
            .order_by("-start_time")
            .first()
        )

        if not lecture:
            return Response(
                {"detail": "No active lecture"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(lecture)

        return Response(serializer.data)


class LectureStudentActivityViewSet(viewsets.ModelViewSet):
    serializer_class = LectureStudentActivitySerializer

    def get_queryset(self):
        queryset = LectureStudentActivity.objects.all()

        lecture = self.request.query_params.get("lecture")

        if lecture:
            queryset = queryset.filter(lecture_id=lecture)

        return queryset


@api_view(["GET"])
def classroom_dashboard(request):

    activities = LectureStudentActivity.objects.filter(
        lecture__status="Running"
    )

    data = {
        "total_students": activities.count(),

        "present": activities.filter(
            attendance="Present"
        ).count(),

        "oral_answers": activities.filter(
            oral_answer=True
        ).count(),

        "written_answers": activities.filter(
            written_answer=True
        ).count(),

        "coding_answers": activities.filter(
            coding_answer=True
        ).count(),

        "homework_completed": activities.filter(
            homework_completed=True
        ).count(),

        "average_score": round(
            activities.aggregate(
                Avg("participation_score")
            )["participation_score__avg"] or 0,
            2,
        ),

        "active_students": activities.filter(
            participation_score__gte=60
        ).count(),
    }

    return Response(data)

@api_view(["GET"])
def attendance_analytics(request):

    activities = LectureStudentActivity.objects.select_related("student")

    total = activities.count()

    present = activities.filter(
        attendance="Present"
    ).count()

    absent = activities.filter(
        attendance="Absent"
    ).count()

    late = activities.filter(
        attendance="Late"
    ).count()

    attendance_percentage = (
        round((present / total) * 100, 2)
        if total > 0 else 0
    )

    departments = []

    department_names = Student.objects.values_list(
        "department",
        flat=True
    ).distinct()

    for department in department_names:

        department_activities = activities.filter(
            student__department=department
        )

        total_students = department_activities.count()

        present_students = department_activities.filter(
            attendance="Present"
        ).count()

        percentage = (
            round((present_students / total_students) * 100, 2)
            if total_students > 0 else 0
        )

        departments.append({
            "department": department,
            "total": total_students,
            "present": present_students,
            "percentage": percentage,
        })

   

    trend_counts = defaultdict(int)

    present_activities = LectureStudentActivity.objects.filter(
        attendance="Present"
    ).select_related("lecture")

    for activity in present_activities:
        trend_counts[str(activity.lecture.lecture_date)] += 1

    trend = []

    for date in sorted(trend_counts.keys()):
        trend.append({
            "date": date,
            "present": trend_counts[date],
        })

    return Response({
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "attendance_percentage": attendance_percentage,
        "departments": departments,
        "trend": trend,
    })

def download_pdf(request, pk):

    lecture = Lecture.objects.get(pk=pk)

    activities = LectureStudentActivity.objects.filter(
        lecture=lecture
    ).select_related("student")

    response = HttpResponse(content_type="application/pdf")

    response["Content-Disposition"] = (
        f'attachment; filename="Lecture_{lecture.id}.pdf"'
    )

    doc = SimpleDocTemplate(
        response,
        pagesize=(8.27 * inch, 11.69 * inch),
    )

    styles = getSampleStyleSheet()

    elements = []

    elements.append(
        Paragraph(
            "<b><font size=18>Student Monitoring System</font></b>",
            styles["Title"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Lecture Topic:</b> {lecture.topic}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Subject:</b> {lecture.subject.name}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Faculty:</b> {lecture.faculty.name}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Department:</b> {lecture.department}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Year:</b> {lecture.year}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Division:</b> {lecture.division}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Date:</b> {lecture.lecture_date}",
            styles["Normal"],
        )
    )

    elements.append(Spacer(1, 20))

    data = [
        [
            "Roll No",
            "Student",
            "Attendance",
            "Oral",
            "Written",
            "Coding",
            "Homework",
            "Score",
        ]
    ]

    for activity in activities:

        data.append(
            [
                activity.student.roll_no,
                activity.student.name,
                activity.attendance,
                "Yes" if activity.oral_answer else "No",
                "Yes" if activity.written_answer else "No",
                "Yes" if activity.coding_answer else "No",
                "Yes" if activity.homework_completed else "No",
                activity.participation_score,
            ]
        )

    table = Table(data)

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.blue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ]
        )
    )

    elements.append(table)

    doc.build(elements)

    return response

@api_view(["GET"])
def performance_dashboard(request):

    activities = LectureStudentActivity.objects.select_related(
        "student"
    )

    top_students = (
        activities.order_by("-participation_score")[:5]
    )

    weak_students = (
        activities.order_by("participation_score")[:5]
    )

    average_score = (
        activities.aggregate(
            Avg("participation_score")
        )["participation_score__avg"] or 0
    )

    return Response(
        {
            "average_score": round(average_score, 2),

            "total_students": activities.count(),

            "highest_score":
                activities.order_by(
                    "-participation_score"
                ).first().participation_score
                if activities.exists()
                else 0,

            "lowest_score":
                activities.order_by(
                    "participation_score"
                ).first().participation_score
                if activities.exists()
                else 0,

            "top_students": [
                {
                    "name": item.student.name,
                    "roll_no": item.student.roll_no,
                    "score": item.participation_score,
                }
                for item in top_students
            ],

            "weak_students": [
                {
                    "name": item.student.name,
                    "roll_no": item.student.roll_no,
                    "score": item.participation_score,
                }
                for item in weak_students
            ],
        }
    )

@api_view(["GET"])
def student_report(request, student_id):

    student = get_object_or_404(
        Student,
        pk=student_id,
    )

    activities = LectureStudentActivity.objects.filter(
        student=student
    )

    total = activities.count()

    present = activities.filter(
        attendance="Present"
    ).count()

    attendance_percentage = (
        round((present / total) * 100, 2)
        if total > 0 else 0
    )

    average_score = (
        activities.aggregate(
            Avg("participation_score")
        )["participation_score__avg"] or 0
    )

    data = {
        "student": {
            "id": student.id,
            "name": student.name,
            "roll_no": student.roll_no,
            "department": student.department,
            "year": student.year,
            "division": student.division,
        },

        "attendance_percentage": attendance_percentage,

        "total_lectures": total,

        "oral_answers": activities.filter(
            oral_answer=True
        ).count(),

        "written_answers": activities.filter(
            written_answer=True
        ).count(),

        "coding_answers": activities.filter(
            coding_answer=True
        ).count(),

        "homework_completed": activities.filter(
            homework_completed=True
        ).count(),

        "average_score": round(
            average_score,
            2,
        ),
    }

    return Response(data)

@api_view(["GET"])
def student_report_pdf(request, student_id):

    student = get_object_or_404(
        Student,
        pk=student_id,
    )

    activities = LectureStudentActivity.objects.filter(
        student=student
    ).select_related("lecture")

    response = HttpResponse(
        content_type="application/pdf"
    )

    response["Content-Disposition"] = (
        f'attachment; filename="Student_{student.roll_no}.pdf"'
    )

    doc = SimpleDocTemplate(response)

    styles = getSampleStyleSheet()

    elements = []

    elements.append(
        Paragraph(
            "<b><font size=18>Student Performance Report</font></b>",
            styles["Title"],
        )
    )

    elements.append(
        Paragraph(f"<b>Name:</b> {student.name}", styles["Normal"])
    )

    elements.append(
        Paragraph(f"<b>Roll No:</b> {student.roll_no}", styles["Normal"])
    )

    elements.append(
        Paragraph(f"<b>Department:</b> {student.department}", styles["Normal"])
    )

    elements.append(
        Paragraph(f"<b>Year:</b> {student.year}", styles["Normal"])
    )

    elements.append(
        Spacer(1, 20)
    )

    table_data = [[
        "Lecture",
        "Attendance",
        "Score",
    ]]

    for activity in activities:

        table_data.append([
            activity.lecture.topic,
            activity.attendance,
            activity.participation_score,
        ])

    table = Table(table_data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.blue),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 1, colors.black),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ])
    )

    elements.append(table)

    doc.build(elements)

    return response