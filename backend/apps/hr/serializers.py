from rest_framework import serializers
from .models import Position, Department

class PositionSerializer(serializers.ModelSerializer):

    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = Position
        fields = ['id', 'title', 'department', 'department_name']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description']