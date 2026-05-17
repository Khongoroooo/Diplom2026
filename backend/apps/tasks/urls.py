from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet, CommentViewSet, CommentFileViewSet,LeaveRequestViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'comment-files', CommentFileViewSet, basename='comment-file')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
urlpatterns = [
    path('', include(router.urls)),
]