from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'message', 'is_read', 
            'created_at', 'task', 'comment', 'sender_name'
        ]