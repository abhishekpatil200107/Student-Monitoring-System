from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):

    queryset = Subject.objects.all().order_by("-id")
    serializer_class = SubjectSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    # -------------------------------------------------
    # Faculty's own subjects
    # -------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="my-subjects",
        permission_classes=[IsAuthenticated],
    )
    def my_subjects(self, request):

        # ---------------------------------------------
        # Only faculty
        # ---------------------------------------------

        if request.user.role != request.user.Role.FACULTY:

            return Response(
                {
                    "message": "Only faculty can view their subjects."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ---------------------------------------------
        # Faculty profile
        # ---------------------------------------------

        try:

            faculty = request.user.faculty_profile

        except Exception:

            return Response(
                {
                    "message": "Faculty profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ---------------------------------------------
        # Get faculty's subjects
        # ---------------------------------------------

        subjects = Subject.objects.filter(
            faculty=faculty
        ).select_related(
            "class_relation"
        ).order_by(
            "semester",
            "name",
        )

        serializer = self.get_serializer(
            subjects,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

