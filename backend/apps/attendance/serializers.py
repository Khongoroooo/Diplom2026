from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers
from .models import Attendance
from django.contrib.auth import get_user_model

User = get_user_model()

class AttendanceSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    late_time = serializers.SerializerMethodField()
    overtime = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField() # Статусыг зассан

    class Meta:
        model = Attendance
        fields = ['id', 'date', 'check_in', 'check_out', 'status', 'late_time', 'overtime', 'full_name']

    def get_full_name(self, obj):
        if obj.user.last_name and obj.user.first_name:
            return f"{obj.user.last_name[0].upper()}.{obj.user.first_name}"
        return obj.user.username

    def get_status(self, obj):
        now = timezone.localtime(timezone.now())
        
        # 1. Хэрэв ирсэн цаг байгаа ч явсан цаг байхгүй бол
        if obj.check_in and not obj.check_out:
            # Хэрэв бүртгэлийн огноо нь өнгөрсөн өдөр бол ШУУД ТАСАЛСАН
            if obj.date < now.date():
                return "ABSENT"
            
            # Өнөөдөр бол дата бааз дахь одоогийн статус (PRESENT эсвэл LATE)
            return obj.status
            
        # 2. Бусад тохиолдолд (бүртгэл бүрэн бол) дата бааз дахь статус
        return obj.status

    def get_late_time(self, obj):
        if obj.check_in and obj.check_out:
            work_duration = obj.check_out - obj.check_in
            required_duration = timedelta(hours=9)
            if work_duration < required_duration:
                diff = required_duration - work_duration
                minutes = int(diff.total_seconds() // 60)
                return f"{minutes} мин"
        return "-"
    
    def get_overtime(self, obj):
        if obj.check_in and obj.check_out:
            work_duration = obj.check_out - obj.check_in
            required_duration = timedelta(hours=9)
            if work_duration > required_duration:
                diff = work_duration - required_duration
                hours = int(diff.total_seconds() // 3600)
                minutes = int((diff.total_seconds() % 3600) // 60)
                if hours > 0:
                    return f"{hours}ц {minutes}м"
                return f"{minutes} мин"
        return "-"

class DailyAttendanceSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    check_in = serializers.SerializerMethodField()
    check_out = serializers.SerializerMethodField()
    late_time = serializers.SerializerMethodField()
    overtime = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'department_name', 'status', 'check_in', 'check_out', 'late_time', 'overtime']

    def get_attendance_obj(self, obj):
        attendances = getattr(obj, 'today_attendance', [])
        return attendances[0] if attendances else None

    def get_full_name(self, obj):
        if obj.last_name and obj.first_name:
            return f"{obj.last_name[0].upper()}.{obj.first_name}"
        return obj.first_name or obj.username

    def get_status(self, obj):
        attendance = self.get_attendance_obj(obj)
        if not attendance:
            return "ABSENT" # Бүртгэлгүй бол тасалсан
            
        now = timezone.localtime(timezone.now())
        # Явахаа мартсан бол таслах логик энд бас орох ёстой
        if attendance.check_in and not attendance.check_out:
            if attendance.date < now.date():
                return "ABSENT"
        
        return attendance.status

    def get_check_in(self, obj):
        attendance = self.get_attendance_obj(obj)
        if attendance and attendance.check_in:
            return timezone.localtime(attendance.check_in).strftime("%H:%M")
        return "-"

    def get_check_out(self, obj):
        attendance = self.get_attendance_obj(obj)
        if attendance and attendance.check_out:
            return timezone.localtime(attendance.check_out).strftime("%H:%M")
        return "-"

    def get_late_time(self, obj):
        attendance = self.get_attendance_obj(obj)
        # 9 цаг ажилласан эсэхийг шалгаж дутуу минутыг гаргана
        if attendance and attendance.check_in and attendance.check_out:
            work_duration = attendance.check_out - attendance.check_in
            required_duration = timedelta(hours=9)
            if work_duration < required_duration:
                diff = required_duration - work_duration
                return f"{int(diff.total_seconds() // 60)} мин"
        return "-"

    def get_overtime(self, obj):
        attendance = self.get_attendance_obj(obj)
        if attendance and attendance.check_in and attendance.check_out:
            work_duration = attendance.check_out - attendance.check_in
            required_duration = timedelta(hours=9)
            if work_duration > required_duration:
                diff = work_duration - required_duration
                hours = int(diff.total_seconds() // 3600)
                minutes = int((diff.total_seconds() % 3600) // 60)
                return f"{hours}ц {minutes}м" if hours > 0 else f"{minutes} мин"
        return "-"