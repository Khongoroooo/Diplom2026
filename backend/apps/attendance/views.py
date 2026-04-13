from datetime import timedelta, datetime
import uuid
from django.utils import timezone
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from .models import Attendance
from .serializers import AttendanceSerializer, DailyAttendanceSerializer, User
import random
from django.db import models



# 1. Админд: QR Token үүсгэх
class GenerateQRTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qr_token = str(uuid.uuid4())
        # 100,000-аас 999,999 хооронд санамсаргүй тоо үүсгэх
        pin_code = str(random.randint(100000, 999999))
        
        # Cache-д QR token болон PIN кодыг хоёуланг нь хадгална
        # PIN-г тусад нь эсвэл QR-тай холбож хадгалж болно. 
        # Ажилтан алийг нь ч ашиглаж болох учраас тус тусад нь хадгалах нь амар.
        cache.set(f"qr_{qr_token}", request.user.id, timeout=35) # Бага зэрэг илүү хугацаа өгөх
        cache.set(f"pin_{pin_code}", request.user.id, timeout=35) 

        return Response({
            "qr_token": qr_token, 
            "pin_code": pin_code, 
            "expires_in": 30
        })

# 2. Ажилтанд: QR-аар ирц бүртгэх (Check-in)
class QRCheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        qr_token = request.data.get("qr_token")
        pin_code = request.data.get("pin_code")
        
        is_valid = False
        if qr_token and cache.get(f"qr_{qr_token}"):
            is_valid = True
        elif pin_code and cache.get(f"pin_{pin_code}"):
            is_valid = True

        if not is_valid:
            return Response({"error": "Код хүчингүй байна."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        # Хэрэв локал цагаар шалгах бол settings.TIME_ZONE-оо Asia/Ulaanbaatar болгосон байх шаардлагатай
        current_time = now.time()
        
        # 08:00 - 10:00-аас хойш ирвэл шууд "Late" эсвэл бүртгэхгүй байж болно
        limit_start = datetime.strptime("08:00", "%H:%M").time()
        limit_end = datetime.strptime("10:00", "%H:%M").time()

        today = now.date()
        attendance, created = Attendance.objects.get_or_create(user=request.user, date=today)

        if not created and attendance.check_in:
            return Response({"error": "Өнөөдөр ирц бүртгүүлсэн байна."}, status=400)

        attendance.check_in = now
        
        # 10:00-аас хойш ирсэн бол шууд ХОЦОРСОН төлөв өгөх үү?
        if current_time > limit_end:
            attendance.status = Attendance.Status.LATE
        else:
            attendance.status = Attendance.Status.PRESENT # Одоогоор ирсэн гэж тэмдэглэнэ
            
        attendance.save()
        return Response(AttendanceSerializer(attendance).data, status=status.HTTP_201_CREATED)

# 3. Ажилтанд: Явсан цаг бүртгэх (Check-out)
class CheckOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        qr_token = request.data.get("qr_token")
        pin_code = request.data.get("pin_code")
        
        # 1. QR эсвэл PIN-г Cache-ээс шалгах (Check-in-тэй ижил)
        is_valid = False
        if qr_token and cache.get(f"qr_{qr_token}"):
            is_valid = True
        elif pin_code and cache.get(f"pin_{pin_code}"):
            is_valid = True

        if not is_valid:
            return Response({"error": "QR код эсвэл PIN код хүчингүй байна."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.now().date()
        try:
            attendance = Attendance.objects.get(user=request.user, date=today)
            
            if attendance.check_out:
                return Response({"error": "Явсан цаг аль хэдийн бүртгэгдсэн байна."}, status=400)
            
            now = timezone.now()
            attendance.check_out = now
            
            # --- 9 ЦАГИЙН ЛОГИК ---
            if attendance.check_in:
                work_duration = attendance.check_out - attendance.check_in
                required_duration = timedelta(hours=9)
                
                # Хэрэв 9 цаг ажиллаагүй бол статус 'LATE' (Хоцорсон/Дутуу) болно
                if work_duration < required_duration:
                    attendance.status = Attendance.Status.LATE
                else:
                    # Хэрэв 10:00-аас өмнө ирээд 9 цаг ажилласан бол 'PRESENT'
                    if attendance.check_in.time() <= timezone.datetime.strptime("10:00", "%H:%M").time():
                        attendance.status = Attendance.Status.PRESENT
            
            attendance.save()
            return Response(AttendanceSerializer(attendance).data)
            
        except Attendance.DoesNotExist:
            return Response({"error": "Өнөөдөр ирсэн цаг бүртгэгдээгүй байна."}, status=400)
# 4. Ажилтанд: Өөрийн ирц харах
class MyAttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Одоо нэвтэрсэн байгаа хэрэглэгч
        queryset = Attendance.objects.filter(user=self.request.user)
        
        # Параметрүүдийг хүлээн авах
        date_str = self.request.query_params.get('date')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        # 1. Өдрөөр шүүх (Хэрэв date ирвэл)
        if date_str:
            try:
                return queryset.filter(date=date_str)
            except ValueError:
                pass

        # 2. Сарын шүүлтүүр
        if month:
            try:
                queryset = queryset.filter(date__month=int(month))
            except ValueError:
                pass
        
        # 3. Жилийн шүүлтүүр
        if year:
            try:
                queryset = queryset.filter(date__year=int(year))
            except ValueError:
                pass
        else:
            # Жил ирээгүй бол одоогийн жилээр хязгаарлах нь зөв (performance-д сайн)
            queryset = queryset.filter(date__year=timezone.now().year)

        return queryset.order_by('-date')
   
# 5. Ажилчдын тухайн өдрийн ирцийг гаргах 
class DailyAttendanceListAPI(generics.ListAPIView):
    serializer_class = DailyAttendanceSerializer

    def get_queryset(self):
        target_date_str = self.request.query_params.get('date')
        
        if target_date_str:
            # String-ийг Date объект руу заавал хөрвүүлнэ
            try:
                from datetime import datetime
                target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                target_date = timezone.localdate()
        else:
            target_date = timezone.localdate() 

        # МАШ ЧУХАЛ: Prefetch доторх шүүлтүүрийг шалгах
        return User.objects.all().prefetch_related(
            models.Prefetch(
                'attendances',
                queryset=Attendance.objects.filter(date=target_date), # Энд date=date байх ёстой
                to_attr='today_attendance'
            )
        ).order_by('first_name')

class AttendanceHistoryAPI(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        date_str = self.request.query_params.get('date')  # Шинээр нэмэв
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if not user_id:
            return Attendance.objects.none()

        queryset = Attendance.objects.filter(user_id=user_id)

        # 1. Хэрэв тодорхой өдөр ирсэн бол сар/жил хамаарахгүй шууд тэр өдрийг шүүнэ
        if date_str:
            try:
                # date_str нь 'YYYY-MM-DD' форматтай ирнэ
                return queryset.filter(date=date_str).order_by('-date')
            except (ValueError, TypeError):
                pass

        # 2. Хэрэв өдөр ирээгүй бол сар болон жилээр шүүх
        if month:
            try:
                month_int = int(month)
                queryset = queryset.filter(date__month=month_int)
            except ValueError:
                pass
        
        if year:
            try:
                year_int = int(year)
                queryset = queryset.filter(date__year=year_int)
            except ValueError:
                queryset = queryset.filter(date__year=timezone.now().year)
        else:
            # Жил ирээгүй бол одоогийн жилээр шүүнэ
            queryset = queryset.filter(date__year=timezone.now().year)

        return queryset.order_by('-date')