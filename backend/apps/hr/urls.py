from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import PositionViewSet, DepartmentViewSet

router = DefaultRouter()
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'departments', DepartmentViewSet, basename='department' )

urlpatterns = [
    path ('', include(router.urls))
]