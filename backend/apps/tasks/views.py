from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Project, Task, Comment, CommentFile
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    CommentSerializer,
    CommentFileSerializer,
    CommentFileWriteSerializer,
)
from django.db.models import Q, Count


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Project.objects.filter(Q(user=user) | Q(members=user))
            .distinct()
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    # ✅ Файл upload хийх боломжтой болгох
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.filter(
            Q(project__user=user) | Q(project__members=user)
        ).distinct()

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset.annotate(
            comment_count=Count('comments', distinct=True)
        ).prefetch_related('comments__user', 'comments__attachments')

    def perform_create(self, serializer):
        serializer.save()

    def get_serializer_context(self):
        # request-ийг serializer руу дамжуулна — абсолют URL үүсгэхэд хэрэгтэй
        return {**super().get_serializer_context(), 'request': self.request}


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        # Зөвхөн top-level comment татна — replies нь nested байна
        queryset = Comment.objects.filter(parent__isnull=True)
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset.select_related('user').prefetch_related(
            'attachments',
            'replies__user',
            'replies__attachments',
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


class CommentFileViewSet(viewsets.ModelViewSet):
    """
    POST multipart/form-data:
      - comment  (int)  — Comment-ийн ID
      - file     (file) — Файл
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        # Бичих үед write serializer, унших үед read serializer
        if self.action in ('create', 'update', 'partial_update'):
            return CommentFileWriteSerializer
        return CommentFileSerializer

    def get_queryset(self):
        return CommentFile.objects.all()

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}