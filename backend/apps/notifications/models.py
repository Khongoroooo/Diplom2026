from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPES = (
        ('mention', 'Mention'),
        ('task_assign', 'Task Assigned'),
        ('comment', 'New Comment'),
        ('status_change', 'Status Changed'),
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=TYPES)
    
    # Холбогдох объектууд (Аль таск, аль сэтгэгдэл болохыг заах)
    task = models.ForeignKey('tasks.Task', on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey('tasks.Comment', on_delete=models.CASCADE, null=True, blank=True)
    
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender} -> {self.recipient}: {self.notification_type}"