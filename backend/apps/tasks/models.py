from django.db import models
from django.conf import settings

class Project(models.Model):
    STATUS_CHOICES = [
        ('new', 'Шинэ төсөл'),
        ('in_progress', 'Хийгдэж буй'),
        ('maintenance', 'Арчилгааны шатанд'),
        ('half_balance', 'Хагас гүйцэтгэлтэй'),
        ('completed', 'Дууссан'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField()
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='owned_projects'
    )
    
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='involved_projects'
    )

    def __str__(self):
        return self.title

# --- ШИНЭЭР НЭМЭХ ТАСК МОДЕЛ ---

class Task(models.Model):
    TASK_STATUS = [
        ('todo', 'To do'),
        ('review', 'Review'),
        ('completed', 'Completed'),
        ('stuck', 'Stuck'),
        ('working', 'Working on it'),
    ]

    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='tasks',
        verbose_name="Хамаарах төсөл"
    )
    title = models.CharField(max_length=255, verbose_name="Даалгаврын нэр")
    
    # Зураг дээрх STATUS багана
    status = models.CharField(
        max_length=20, 
        choices=TASK_STATUS, 
        default='todo',
        verbose_name="Төлөв"
    )
    
    # Зураг дээрх PERSON багана
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks',
        verbose_name="Хариуцагч"
    )
    
    # Зураг дээрх NUMBER TEST багана (Жишээ нь: гүйцэтгэлийн хувь эсвэл оноо)
    number_test = models.IntegerField(default=0, verbose_name="Тоон үзүүлэлт")
    
    # Зураг дээрх TEXT багана
    note = models.TextField(blank=True, null=True, verbose_name="Тэмдэглэл")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True, verbose_name="Дуусах хугацаа")

    class Meta:
        verbose_name = "Даалгавар"
        verbose_name_plural = "Даалгаврууд"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.project.title} - {self.title}"