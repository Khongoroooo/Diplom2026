

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Task, CommentFile, Comment

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    member_details = serializers.SerializerMethodField()

    # queryset-ийг User.objects.all() хэвээр үлдээж болно, эсвэл хэрэгцээндээ тааруулж шүүнэ
    members = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.all(),
        required=False # Заавал гишүүн гэлгүй төсөл үүсгэж болохоор
    )

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'created_at', 
            'start_date', 'user', 'user_name', 'status', 
            'members', 'member_details'
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.last_name} {obj.user.first_name}".strip() or obj.user.username
        return "Тодорхойгүй"

    def get_member_details(self, obj):
        return [
            {
                "id": m.id, 
                "full_name": f"{m.last_name} {m.first_name}".strip() or m.username
            } 
            for m in obj.members.all()
        ]

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    # comment_count-ийг IntegerField-ээр зарлах нь SerializerMethodField-ээс хурдан
    comment_count = serializers.IntegerField(read_only=True) 

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'project', 'status', 
            'assigned_to', 'assigned_to_name', 
            'number_test', 'note', 'comments', 
            'comment_count' # Энд нэмэгдлээ
        ]

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.last_name} {obj.assigned_to.first_name}".strip() or obj.assigned_to.username
        return "Эзэнгүй"

    def get_comments(self, obj):
        queryset = obj.comments.filter(parent__isnull=True)
        return CommentSerializer(queryset, many=True).data
class CommentFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentFile
        fields = ['id', 'file', 'uploaded_at']

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    attachments = CommentFileSerializer(many=True, read_only=True)
    replies = serializers.SerializerMethodField() # Хариултуудыг авах

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_name', 'content', 'task',
            'parent', 'attachments', 'replies', 'created_at'
        ]
        read_only_fields = ['user']

    def get_user_name(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}".strip() or obj.user.username

    def get_replies(self, obj):
        # Зөвхөн энэ сэтгэгдэлд хариулсан сэтгэгдлүүдийг рекурсив байдлаар авна
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []