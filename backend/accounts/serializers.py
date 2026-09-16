from django.db import transaction
from rest_framework import serializers

from .models import User
from students.models import Student
from classes.models import Class
from departments.models import Department


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "profile_image",
        ]

class StudentRegistrationSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)

    email = serializers.EmailField()
    name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=15)

    roll_no = serializers.CharField(max_length=20)

    department_id = serializers.IntegerField()
    class_id = serializers.IntegerField()

    division = serializers.ChoiceField(
        choices=[
            ("A", "Division A"),
            ("B", "Division B"),
            ("C", "Division C"),
        ],
        default="A",
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email is already registered."
            )

        if Student.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email is already registered."
            )

        return value

    def validate_roll_no(self, value):
        if Student.objects.filter(roll_no=value).exists():
            raise serializers.ValidationError(
                "Roll number already exists."
            )

        return value

    def validate(self, attrs):

        department_id = attrs["department_id"]
        class_id = attrs["class_id"]

        try:
            department = Department.objects.get(
                id=department_id,
                status=True,
            )
        except Department.DoesNotExist:
            raise serializers.ValidationError({
                "department_id": "Invalid department."
            })

        try:
            student_class = Class.objects.get(
                id=class_id,
                status=True,
            )
        except Class.DoesNotExist:
            raise serializers.ValidationError({
                "class_id": "Invalid class."
            })

        if student_class.department_id != department.id:
            raise serializers.ValidationError({
                "class_id":
                    "Selected class does not belong to the selected department."
            })

        attrs["department"] = department
        attrs["student_class"] = student_class

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        department = validated_data.pop("department")
        student_class = validated_data.pop("student_class")

        username = validated_data.pop("username")
        password = validated_data.pop("password")

        email = validated_data["email"]
        name = validated_data["name"]
        phone = validated_data["phone"]

        # -----------------------------------------
        # Create STUDENT user
        # -----------------------------------------

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=User.Role.STUDENT,
            account_status=User.AccountStatus.PENDING,
            phone=phone,
        )

        # -----------------------------------------
        # Create Student profile
        # -----------------------------------------

        student = Student.objects.create(
            user=user,

            roll_no=validated_data["roll_no"],
            name=name,
            email=email,
            phone=phone,

            department=department.name,
            department_relation=department,

            year=student_class.year,
            division=validated_data["division"],

            class_relation=student_class,

            status="Active",

            approval_status="PENDING",
        )

        return student

