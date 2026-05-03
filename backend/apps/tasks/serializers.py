from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Task, CommentFile, Comment

User = get_user_model()


# ─── Project ──────────────────────────────────────────────────────────────────

class ProjectSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    member_details = serializers.SerializerMethodField()
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False,
    )

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'created_at',
            'start_date', 'user', 'user_name', 'status',
            'members', 'member_details',
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
                "full_name": f"{m.last_name} {m.first_name}".strip() or m.username,
            }
            for m in obj.members.all()
        ]


# ─── CommentFile ──────────────────────────────────────────────────────────────

class CommentFileSerializer(serializers.ModelSerializer):
    # Абсолют URL буцаана — React дээр <a href> шууд ашиглаж болно
    file = serializers.SerializerMethodField()

    class Meta:
        model = CommentFile
        fields = ['id', 'file', 'uploaded_at']

    def get_file(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


# Write serializer — file upload хийхэд ашиглана
class CommentFileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentFile
        fields = ['id', 'comment', 'file', 'uploaded_at']


# ─── Comment ──────────────────────────────────────────────────────────────────

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    attachments = CommentFileSerializer(many=True, read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_name', 'content', 'task',
            'parent', 'attachments', 'replies', 'created_at',
        ]
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}".strip() or obj.user.username

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []


# ─── Task ─────────────────────────────────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    comment_count = serializers.IntegerField(read_only=True)
    # Task-ийн файлыг абсолют URL-ээр буцаана
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'project', 'status',
            'assigned_to', 'assigned_to_name',
            'number_test', 'note',
            'file',        # write: файл upload хийх
            'file_url',    # read:  файлын бүтэн URL
            'comments', 'comment_count',
        ]
        # file нь write-only: serializer output дотор raw path харуулахгүй
        extra_kwargs = {
            'file': {'write_only': True, 'required': False, 'allow_null': True},
        }

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.last_name} {obj.assigned_to.first_name}".strip() or obj.assigned_to.username
        return "Эзэнгүй"

    def get_comments(self, obj):
        queryset = obj.comments.filter(parent__isnull=True)
        return CommentSerializer(queryset, many=True, context=self.context).data