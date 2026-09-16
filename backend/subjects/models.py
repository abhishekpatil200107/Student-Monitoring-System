from django.db import models

from classes.models import Class

class Subject(models.Model):
  
    SEMESTERS = [
        ("1", "Semester 1"),
        ("2", "Semester 2"),
        ("3", "Semester 3"),
        ("4", "Semester 4"),
        ("5", "Semester 5"),
        ("6", "Semester 6"),
        ("7", "Semester 7"),
        ("8", "Semester 8"),
    ]

    code = models.CharField(
        max_length=20,
        unique=True,  
    )

    name = models.CharField(
        max_length=150,
    )

    department = models.CharField(
        max_length=100,
    )

    semester = models.CharField(
        max_length=5,
        choices=SEMESTERS,
    )

    credits = models.PositiveIntegerField()

    faculty = models.ForeignKey(
        "faculty.Faculty",
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name="subjects",
    )

    class_relation = models.ForeignKey(
        Class,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subjects", 
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.name
