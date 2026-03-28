from django.db import models
from django.conf import settings
from django.utils import timezone

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Ирсэн"
        LATE = "LATE", "Хоцорсон"
        ABSENT = "ABSENT", "Тасалсан"
        LEAVE = "LEAVE", "Чөлөөтэй"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='attendances'
    )
    date = models.DateField(default=timezone.now)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PRESENT
    )

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} - {self.date}"