from django.db import transaction

from rest_framework import serializers

from accounts.models import User
from classes.models import Class
from departments.models import Department

from .models import Faculty


class FacultySerializer(serializers.ModelSerializer):

    department_id = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    assigned_classes = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Class.objects.filter(status=True),
        required=False,
    )

    username = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=6,
    )

    class Meta:
        model = Faculty

        fields = [
            "id",
            "user",
            "employee_id",
            "name",
            "email",
            "phone",
            "department",
            "department_id",
            "designation",
            "qualification",
            "experience",
            "joining_date",
            "status",
            "profile",
            "assigned_classes",
            "username",
            "password",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "user",
            "department",
            "created_at",
            "updated_at",
        ]

    # -----------------------------------------
    # Department
    # -----------------------------------------

    def validate_department_id(self, value):

        if not Department.objects.filter(
            id=value,
            status=True,
        ).exists():
            raise serializers.ValidationError(
                "Invalid department."
            )

        return value

    # -----------------------------------------
    # Assigned Classes
    # -----------------------------------------

    def validate_assigned_classes(self, classes):

        department_id = self.initial_data.get("department_id")

        if department_id:

            try:
                department_id = int(department_id)
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    "Invalid department."
                )

            invalid_classes = [
                class_obj.id
                for class_obj in classes
                if class_obj.department_id != department_id
            ]

            if invalid_classes:
                raise serializers.ValidationError(
                    "All assigned classes must belong to the selected department."
                )

        return classes

    # -----------------------------------------
    # General validation
    # -----------------------------------------

    def validate(self, attrs):

        # CREATE
        if self.instance is None:

            username = attrs.get("username")
            password = attrs.get("password")

            if not username:
                raise serializers.ValidationError({
                    "username": "Username is required."
                })

            if not password:
                raise serializers.ValidationError({
                    "password": "Password is required."
                })

            if User.objects.filter(
                username=username
            ).exists():
                raise serializers.ValidationError({
                    "username": "Username already exists."
                })

            if User.objects.filter(
                email=attrs.get("email")
            ).exists():
                raise serializers.ValidationError({
                    "email": "Email is already registered."
                })

        # UPDATE
        else:

            # Department is required for an update.
            if not attrs.get("department_id"):

                raise serializers.ValidationError({
                    "department_id": "Department is required."
                })

        return attrs

    # -----------------------------------------
    # CREATE
    # -----------------------------------------

    @transaction.atomic
    def create(self, validated_data):

        department_id = validated_data.pop(
            "department_id"
        )

        assigned_classes = validated_data.pop(
            "assigned_classes",
            [],
        )

        username = validated_data.pop(
            "username"
        )

        password = validated_data.pop(
            "password"
        )

        department = Department.objects.get(
            id=department_id
        )

        user = User.objects.create_user(
            username=username,
            email=validated_data["email"],
            password=password,
            role=User.Role.FACULTY,
            phone=validated_data.get("phone", ""),
        )

        faculty = Faculty.objects.create(
            user=user,
            department_relation=department,
            department=department.name,
            **validated_data,
        )

        faculty.assigned_classes.set(
            assigned_classes
        )

        return faculty

    # -----------------------------------------
    # UPDATE
    # -----------------------------------------

    @transaction.atomic
    def update(self, instance, validated_data):

        department_id = validated_data.pop(
            "department_id",
            None,
        )

        assigned_classes = validated_data.pop(
            "assigned_classes",
            None,
        )

        # Never change username/password
        # from the edit form.
        validated_data.pop("username", None)
        validated_data.pop("password", None)

        # Update department
        if department_id is not None:

            department = Department.objects.get(
                id=department_id
            )

            instance.department_relation = department
            instance.department = department.name

        # Update normal fields
        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value,
            )

        instance.save()

        # Update assigned classes
        if assigned_classes is not None:

            instance.assigned_classes.set(
                assigned_classes
            )

        # Update linked User
        if instance.user:

            user = instance.user

            user.email = instance.email
            user.phone = instance.phone

            user.save()

        return instance