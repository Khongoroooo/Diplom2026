from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, CommentFileViewSet, CommentViewSet

# Router тохиргоо
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'comment-files', CommentFileViewSet, basename='comment-file')

urlpatterns = [
    path('', include(router.urls)),
]