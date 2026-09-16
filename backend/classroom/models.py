from django.db import models


class Lecture(models.Model):

    STATUS_CHOICES = [
        ("Running", "Running"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.CASCADE,
        related_name="lectures",
    )

    faculty = models.ForeignKey(
        "faculty.Faculty",
        on_delete=models.CASCADE,
        related_name="lectures",
    )

    topic = models.CharField(
        max_length=200,
    )

    department = models.CharField(
        max_length=100,
    )

    year = models.CharField(
        max_length=20,
    )

    division = models.CharField(
        max_length=20,
    )

    lecture_date = models.DateField(
        auto_now_add=True,
    )

    start_time = models.DateTimeField(
        auto_now_add=True,
    )

    end_time = models.DateTimeField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Running",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-start_time"]

    def __str__(self):
        return f"{self.subject} - {self.topic}"

class LectureStudentActivity(models.Model):

    ATTENDANCE = [
        ("Present", "Present"),
        ("Absent", "Absent"),
        ("Late", "Late"),
    ]

    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="activities",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="lecture_activities",
    )

    attendance = models.CharField(
        max_length=20,
        choices=ATTENDANCE,
        default="Present",
    )

    oral_answer = models.BooleanField(
        default=False,
    )

    written_answer = models.BooleanField(
        default=False,
    )

    coding_answer = models.BooleanField(
        default=False,
    )

    homework_completed = models.BooleanField(
        default=False,
    )

    confidence = models.PositiveSmallIntegerField(
        default=0,
    )

    communication = models.PositiveSmallIntegerField(
        default=0,
    )

    understanding = models.PositiveSmallIntegerField(
        default=0,
    )

    behaviour = models.PositiveSmallIntegerField(
        default=0,
    )

    participation_score = models.PositiveIntegerField(
        default=0,
    )

    remarks = models.TextField(
        blank=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):

        score = 0

        if self.attendance == "Present":
            score += 10

        if self.oral_answer:
            score += 20

        if self.written_answer:
            score += 20

        if self.coding_answer:
            score += 25

        if self.homework_completed:
            score += 15

        score += self.confidence
        score += self.communication
        score += self.understanding
        score += self.behaviour

        self.participation_score = score

        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("lecture", "student")

    def __str__(self):
        return f"{self.student.name} - {self.lecture.topic}"