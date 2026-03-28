from rest_framework import viewsets
from .serializers import PositionSerializer, DepartmentSerializer
from .models import Position, Department
from rest_framework.permissions import IsAuthenticated

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]