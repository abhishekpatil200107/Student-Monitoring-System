from rest_framework import serializers
from .models import Lecture, LectureStudentActivity
from students.serializers import StudentSerializer


class LectureSerializer(serializers.ModelSerializer):

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    faculty_name = serializers.CharField(
        source="faculty.name",
        read_only=True,
    )

    class Meta:
        model = Lecture
        fields = "__all__"


class LectureStudentActivitySerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()

    class Meta:
        model = LectureStudentActivity
        fields = "__all__"

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "roll_no": obj.student.roll_no,
            "name": obj.student.name,
        }