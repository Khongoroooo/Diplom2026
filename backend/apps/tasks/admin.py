from django.contrib import admin
from .models import Project, Task, Comment, CommentFile

# Сэтгэгдлийн файлыг сэтгэгдэл дотор нь хавсаргаж харуулах (Inline)
class CommentFileInline(admin.TabularInline):
    model = CommentFile
    extra = 1

# Даалгаврын сэтгэгдлийг даалгавар дотор нь харуулах (Inline)
class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    show_change_link = True

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'status', 'user', 'start_date', 'created_at')
    list_filter = ('organization', 'status', 'created_at')
    search_fields = ('title', 'description')
    filter_horizontal = ('members',) # Олон гишүүдийг сонгоход хялбар болгоно
    date_hierarchy = 'created_at'

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # Зураг дээрх шиг бүх чухал багануудыг харуулна
    list_display = ('title', 'project', 'organization', 'status', 'assigned_to', 'due_date', 'number_test')
    
    # Байгууллага, Төлөв, Төсөл болон Хариуцагчаар шүүх
    list_filter = ('organization', 'status', 'project', 'assigned_to')
    
    # Хайлт хийх (Төслийн нэр эсвэл Даалгаврын нэрээр)
    search_fields = ('title', 'project__title', 'note')
    
    # Огнооны дарааллаар шүүх хуанли
    date_hierarchy = 'created_at'
    
    # Даалгавар дотор сэтгэгдлүүдийг харах боломжтой болгох
    inlines = [CommentInline]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'task', 'organization', 'created_at', 'parent')
    list_filter = ('organization', 'created_at')
    search_fields = ('content', 'user__email', 'task__title')
    inlines = [CommentFileInline]

@admin.register(CommentFile)
class CommentFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'comment', 'organization', 'uploaded_at')
    list_filter = ('organization',)