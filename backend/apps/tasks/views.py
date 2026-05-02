from rest_framework import viewsets, permissions
from .models import Project, Task, Comment, CommentFile
from .serializers import ProjectSerializer, TaskSerializer, CommentFileSerializer, CommentSerializer
from django.db.models import Q, Count

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(user=user) | Q(members=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Хэрэглэгчийн хамааралтай төслүүдийн таскуудыг шүүх
        queryset = Task.objects.filter(
            Q(project__user=user) | Q(project__members=user)
        ).distinct()

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        # Сэтгэгдлийн тоог тоолох болон бусад хамаарлыг урьдчилан ачаалах
        return queryset.annotate(
        # distinct=True нь давхардаж тоолохоос сэргийлнэ
        comment_count=Count('comments', distinct=True) 
    ).prefetch_related('comments__user', 'comments__attachments')

    def perform_create(self, serializer):
        serializer.save()

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Зөвхөн тухайн task-д хамаарах сэтгэгдлүүдийг шүүж авах боломжтой
        queryset = Comment.objects.all()
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset.select_related('user').prefetch_related('attachments', 'replies')

    def perform_create(self, serializer):
        # Сэтгэгдэл бичиж буй хэрэглэгчийг автоматаар хадгалах
        serializer.save(user=self.request.user)

class CommentFileViewSet(viewsets.ModelViewSet):
    serializer_class = CommentFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CommentFile.objects.all()