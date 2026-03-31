from rest_framework import serializers
from .models import Attendance
from django.contrib.auth import get_user_model

User = get_user_model()

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
    


class DailyAttendanceSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    check_in = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'department_name', 'status', 'check_in']

    def get_full_name(self, obj):
        # Хэрэв овог (last_name) болон нэр (first_name) хоёулаа байвал
        if obj.last_name and obj.first_name:
            # Овгийн эхний үсэг + цэг + Нэр (Жишээ нь: Б.Тэмүүлэн)
            return f"{obj.last_name[0].upper()}.{obj.first_name}"
        return obj.first_name or obj.username # Хэрэв нэр байхгүй бол username харуулна

    def get_status(self, obj):
        # view-ээс дамжуулсан prefetch датаг ашиглах
        attendance = obj.today_attendance[0] if obj.today_attendance else None
        return attendance.get_status_display() if attendance else "Бүртгэлгүй"

    def get_check_in(self, obj):
        attendance = obj.today_attendance[0] if obj.today_attendance else None
        return attendance.check_in.strftime("%H:%M") if attendance and attendance.check_in else "-"