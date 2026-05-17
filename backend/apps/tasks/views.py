from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Project, Task, Comment, CommentFile, LeaveRequest
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    CommentSerializer,
    CommentFileSerializer,
    CommentFileWriteSerializer,
    LeaveRequestSerializer
)
from django.db.models import Q, Count
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from apps.notifications.utils import (
    process_mentions,
    notify_new_comment,
    notify_task_assigned,
    notify_status_change,
)
User = get_user_model()
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.filter(organization=user.organization)

    # 3. Role-оор шүүх (Засаж сайжруулсан логик)
        if user.role == 'ADMIN':
            return queryset.order_by('-created_at')
        return (
            Project.objects.filter(Q(user=user) | Q(members=user))
            .distinct()
            .order_by('-created_at')
        )
 
    def perform_create(self, serializer):
    # Хэрэглэгчийн байгууллагыг төсөлд нь давхар оноож өгөх
        serializer.save(
            user=self.request.user, 
            organization=self.request.user.organization
     )
    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
    
        project = self.get_object()
        member_ids = set()
        if project.user_id:
            member_ids.add(project.user_id)
        member_ids.update(project.members.values_list('id', flat=True))
        users = User.objects.filter(id__in=member_ids).values(
            'id', 'username', 'first_name', 'last_name'
        )

        data = [
            {
                'id': u['username'],
                'display': (
                    f"{u['first_name']} {u['last_name']}".strip() or u['username']
                ),
                'username': u['username'],
            }
            for u in users
        ]
        return Response(data)



class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
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
        task = serializer.save()
        # Таск үүсгэх үед assigned_to байвал мэдэгдэл илгээх
        if task.assigned_to and task.assigned_to != self.request.user:
            notify_task_assigned(
                task=task,
                assigned_to=task.assigned_to,
                assigned_by=self.request.user,
            )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_status = old_instance.status if hasattr(old_instance, 'status') else None
        old_assigned = old_instance.assigned_to_id if hasattr(old_instance, 'assigned_to_id') else None

        task = serializer.save()
        # assigned_to өөрчлөгдвөл мэдэгдэл
        new_assigned = task.assigned_to_id if hasattr(task, 'assigned_to_id') else None
        if new_assigned and new_assigned != old_assigned:
            notify_task_assigned(
                task=task,
                assigned_to=task.assigned_to,
                assigned_by=self.request.user,
            )

        # Статус өөрчлөгдвөл мэдэгдэл
        new_status = task.status if hasattr(task, 'status') else None
        if old_status and new_status and old_status != new_status:
            notify_status_change(
                task=task,
                changed_by=self.request.user,
                old_status=old_status,
                new_status=new_status,
            )

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
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
        comment = serializer.save(user=self.request.user)

        # 1. @mention мэдэгдэл — зөвхөн project members-д
        process_mentions(comment)
        # 2. Шинэ comment мэдэгдэл — таскийн бусад оролцогчдод
        notify_new_comment(comment)

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}
class CommentFileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CommentFileWriteSerializer
        return CommentFileSerializer

    def get_queryset(self):
        return CommentFile.objects.all()

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}
    
class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # 1. ADMIN - Бүгдийг харна
        if user.role == 'ADMIN' or user.is_staff:
            return LeaveRequest.objects.filter(organization=user.organization)
        
        # 2. HR - Менежер зөвшөөрсөн болон HR-д ирсэн бүх хүсэлтийг харна
        if user.role == 'HR':
            return LeaveRequest.objects.filter(
                Q(status='manager_approved') | Q(status='hr_processed'),
                organization=user.organization
            )

        # 3. MANAGER - Өөрт нь ирсэн хүсэлтүүд + Өөрийнх нь илгээсэн хүсэлтүүд
        if user.role == 'MANAGER':
            return LeaveRequest.objects.filter(
                Q(manager=user) | Q(user=user),
                organization=user.organization
            )

        # 4. АЖИЛТАН - Зөвхөн өөрийнхөө илгээснийг харна
        return LeaveRequest.objects.filter(Q(user=user) | Q(manager=user)).distinct()
    @action(detail=False, methods=['get'], url_path='available-approvers')
    def available_approvers(self, request):
        user = request.user
        # Хэрэв ажилтан бол менежерүүдийг харна
        # Хэрэв менежер бол HR-уудыг харна
        if user.role == 'MANAGER':
            approvers = User.objects.filter(role='HR', organization=user.organization)
        else:
            approvers = User.objects.filter(role='MANAGER', organization=user.organization)
            
        data = [{"id": a.id, "full_name": f"{a.last_name} {a.first_name}".strip() or a.username} for a in approvers]
        return Response(data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_leave(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'rejected'
        leave.manager_note = request.data.get('note', 'Татгалзсан')
        leave.save()
        return Response({"status": "Хүсэлтийг татгалзлаа."})

    def perform_create(self, serializer):
        # Frontend-ээс сонгож ирсэн manager_id-г ашиглана
        serializer.save(
            user=self.request.user, 
            organization=self.request.user.organization
        )

    # МЕНЕЖЕР БАТЛАХ ҮЙЛДЭЛ
    @action(detail=True, methods=['post'], url_path='manager-approve')
    def manager_approve(self, request, pk=None):
        leave = self.get_object()
        if request.user != leave.manager:
            return Response({"error": "Та энэ хүсэлтийг батлах эрхгүй."}, status=status.HTTP_403_FORBIDDEN)
        
        leave.status = 'manager_approved'
        leave.manager_note = request.data.get('note', '')
        leave.save()
        return Response({"status": "Менежер баталлаа. Хүсэлт HR-руу шилжлээ."})

    # HR БАТЛАХ (ДУУСГАХ) ҮЙЛДЭЛ
    @action(detail=True, methods=['post'], url_path='hr-process')
    def hr_process(self, request, pk=None):
        if request.user.role != 'HR':
            return Response({"error": "Зөвхөн HR бүртгэж авах боломжтой."}, status=status.HTTP_403_FORBIDDEN)
        
        leave = self.get_object()
        leave.status = 'hr_processed'
        leave.hr_note = request.data.get('note', '')
        leave.save()
        return Response({"status": "HR хүсэлтийг бүртгэж авлаа."})