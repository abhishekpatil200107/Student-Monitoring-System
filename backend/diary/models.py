from django.db import models
from students.models import Student

class DailyDiary(models.Model):

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE
    )

    date = models.DateField()

    subject = models.CharField(max_length=150)

    study_hours = models.DecimalField(
        max_digits=4,
        decimal_places=1,
    )

    homework = models.TextField()

    topics = models.TextField(blank=True)

    remarks = models.TextField(blank=True)

    parent_signature = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.date}"