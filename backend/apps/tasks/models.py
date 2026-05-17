from django.db import models
from django.conf import settings
from apps.organizations.models import BaseTenantModel

class Project(BaseTenantModel):
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
    end_date = models.DateField(null=True, blank=True)
    
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='owned_projects'
    )
    @property
    def progress_percentage(self):
        """
        Төсөл доторх нийт таскуудын хэдэн хувь нь 'completed' байгааг тооцоолох
        """
        tasks = self.tasks.all()
        total_tasks = tasks.count()
        if total_tasks == 0:
            return 0
        
        completed_tasks = tasks.filter(status='completed').count()
        return int((completed_tasks / total_tasks) * 100)

    @property
    def end_date_status(self):
        """
        Дуусах огноо хэтэрсэн эсэхийг шалгах
        """
        from django.utils import timezone
        if self.status != 'completed' and self.start_date: # Жишээ нь start_date-ээс хойш 30 хоног гэж тооцвол
            # Хэрэв танд end_date байгаа бол түүгээр нь шалгана
            pass
        return False
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='involved_projects'
    )

    def __str__(self):
        return self.title
    

# --- ШИНЭЭР НЭМЭХ ТАСК МОДЕЛ ---

class Task(BaseTenantModel):
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
    file = models.FileField(upload_to='tasks/attachments/%Y/%m/%d/', null=True, blank=True, verbose_name="Хавсаргасан файл")
    
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
    
import os

class Comment(BaseTenantModel):
    # Хэрэглэгч болон Тасктай холбох
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='comments' # related_name-ийг өөрчилсөн (өмнө нь төсөлтэй давхцаж байсан)
    )
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    
    # Сэтгэгдлийн агуулга
    # max_length-ийг хэтэрхий том тавих хэрэггүй, TextField ашиглах нь тохиромжтой
    content = models.TextField(verbose_name="Сэтгэгдэл")
    
    # Reply систем (Нэг сэтгэгдэлд хариу бичих)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    
    # Хугацаа
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at'] # Шинэ нь дээрээ харагдана

    def __str__(self):
        return f"{self.user.username}-ийн сэтгэгдэл ({self.task.title})"

# --- ФАЙЛ ХАВСАРГАХ ХЭСЭГ ---

class CommentFile(BaseTenantModel):
    comment = models.ForeignKey(
        Comment, 
        on_delete=models.CASCADE, 
        related_name='attachments'
    )
    # FileField нь зураг болон бусад бүх файлыг хадгалж чадна
    file = models.FileField(upload_to='comments/attachments/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255, blank=True, default='')

    def is_image(self):
        """Файл нь зураг эсэхийг шалгах функц"""
        extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        return any(self.file.name.lower().endswith(ext) for ext in extensions)

    def filename(self):
        return os.path.basename(self.file.name)
class LeaveRequest(BaseTenantModel):
    LEAVE_TYPES = [
        ('sick', 'Өвчтэй'),
        ('vacation', 'Ээлжийн амралт'),
        ('personal', 'Ар гэрийн гачигдал'),
        ('other', 'Бусад'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Менежер хүлээгдэж буй'),
        ('manager_approved', 'Менежер зөвшөөрсөн (HR руу шилжсэн)'),
        ('rejected', 'Татгалзсан'),
        ('hr_processed', 'HR бүртгэж авсан (Дууссан)'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='my_leave_requests'
    )
    # Ажилтан хүсэлт илгээхэд түүний менежер автоматаар тодорхойлогдоно
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='managed_leave_requests'
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    manager_note = models.TextField(blank=True, null=True) # Менежер тайлбар бичиж болно
    hr_note = models.TextField(blank=True, null=True)      # HR тайлбар бичиж болно
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_leave_type_display()}"