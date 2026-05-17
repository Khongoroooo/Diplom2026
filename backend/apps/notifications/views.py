from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Notification.objects
            .filter(recipient=self.request.user)
            .select_related('sender', 'task', 'comment')
            .order_by('-created_at')
        )


class NotificationMarkReadView(APIView):
    """PATCH /api/notifications/<pk>/read/ — нэг мэдэгдэл уншсанаар тэмдэглэх"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            noti = Notification.objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        noti.is_read = True
        noti.save(update_fields=['is_read'])
        return Response(NotificationSerializer(noti).data)


class NotificationMarkAllReadView(APIView):
    """PATCH /api/notifications/read-all/ — бүгдийг уншсанаар тэмдэглэх"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        updated = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True)
        return Response({'marked_read': updated})


class NotificationUnreadCountView(APIView):
    """GET /api/notifications/unread-count/ — badge тоо"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({'unread_count': count})