from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    full_name = serializers.SerializerMethodField()
    department_name = serializers.ReadOnlyField(source='user.department.name')
    position_name = serializers.ReadOnlyField(source='user.position.name')

    class Meta:
        model = Attendance
        fields = [
            'id', 'user', 'user_email', 'full_name', 'department_name', 
            'position_name', 'date', 'check_in', 'check_out', 'status'
        ]
        read_only_fields = ['user', 'date', 'status']

    def get_full_name(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}"