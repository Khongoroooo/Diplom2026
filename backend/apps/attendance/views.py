from datetime import timedelta, datetime, time
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

# ── Ажлын цагийн тохиргоо ──────────────────────────────────────────────────
WORK_START      = time(8, 0)   # 08:00 — ирэх цагийн эхлэл
LATE_THRESHOLD  = time(10, 0)  # 10:00 — үүнээс хойш ирвэл ХОЦОРСОН
REQUIRED_HOURS  = timedelta(hours=9)  # Өдөрт ажиллах цаг


# 1. Админд: QR Token үүсгэх
class GenerateQRTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qr_token = str(uuid.uuid4())
        pin_code  = str(random.randint(100000, 999999))

        cache.set(f"qr_{qr_token}", request.user.id, timeout=35)
        cache.set(f"pin_{pin_code}", request.user.id, timeout=35)

        return Response({
            "qr_token":  qr_token,
            "pin_code":  pin_code,
            "expires_in": 30,
        })


# 2. Ажилтанд: QR-аар ирц бүртгэх (Check-in)
class QRCheckInView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        qr_token = request.data.get("qr_token")
        pin_code  = request.data.get("pin_code")

        is_valid = False
        if qr_token and cache.get(f"qr_{qr_token}"):
            is_valid = True
        elif pin_code and cache.get(f"pin_{pin_code}"):
            is_valid = True

        if not is_valid:
            return Response(
                {"error": "Код хүчингүй байна."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now          = timezone.now()
        # Локал цагийг ашиглана (settings.py-д TIME_ZONE = 'Asia/Ulaanbaatar' байх ёстой)
        local_now    = timezone.localtime(now)
        current_time = local_now.time()
        today        = local_now.date()

        attendance, created = Attendance.objects.get_or_create(
            user=request.user, date=today
        )

        if not created and attendance.check_in:
            return Response(
                {"error": "Өнөөдөр ирц бүртгүүлсэн байна."},
                status=400,
            )

        attendance.check_in = now

        # ── Статус тодорхойлох логик ──────────────────────────────────────
        # 10:00-аас хойш ирвэл → ХОЦОРСОН
        # 08:00 – 10:00 хооронд ирвэл → ИРСЭН (check-out үед дахин шалгана)
        if current_time > LATE_THRESHOLD:
            attendance.status = Attendance.Status.LATE
        else:
            attendance.status = Attendance.Status.PRESENT

        attendance.save()
        return Response(
            AttendanceSerializer(attendance).data,
            status=status.HTTP_201_CREATED,
        )


# 3. Ажилтанд: Явсан цаг бүртгэх (Check-out)
class CheckOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        qr_token = request.data.get("qr_token")
        pin_code  = request.data.get("pin_code")

        is_valid = False
        if qr_token and cache.get(f"qr_{qr_token}"):
            is_valid = True
        elif pin_code and cache.get(f"pin_{pin_code}"):
            is_valid = True

        if not is_valid:
            return Response(
                {"error": "QR код эсвэл PIN код хүчингүй байна."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.localdate()
        try:
            attendance = Attendance.objects.get(user=request.user, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Өнөөдөр ирсэн цаг бүртгэгдээгүй байна."},
                status=400,
            )

        if attendance.check_out:
            return Response(
                {"error": "Явсан цаг аль хэдийн бүртгэгдсэн байна."},
                status=400,
            )

        now = timezone.now()
        attendance.check_out = now

        # ── 9 цагийн логик ────────────────────────────────────────────────
        if attendance.check_in:
            work_duration = attendance.check_out - attendance.check_in

            if work_duration < REQUIRED_HOURS:
                # 9 цаг хүрэхгүй ажилласан → ХОЦОРСОН
                # (10:00-аас өмнө ирсэн байсан ч гэсэн)
                attendance.status = Attendance.Status.LATE
            else:
                # 9 цаг буюу түүнээс дээш ажилласан
                check_in_local = timezone.localtime(attendance.check_in).time()
                if check_in_local <= LATE_THRESHOLD:
                    # 10:00-аас өмнө ирж, 9 цаг ажилласан → ИРСЭН
                    attendance.status = Attendance.Status.PRESENT
                # 10:00-аас хойш ирсэн бол check-in үед LATE болгосон тул хэвээр үлдэнэ

        attendance.save()
        return Response(AttendanceSerializer(attendance).data)


# 4. Ажилтанд: Өөрийн ирц харах
class MyAttendanceListView(generics.ListAPIView):
    serializer_class   = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Attendance.objects.filter(user=self.request.user)

        date_str = self.request.query_params.get('date')
        month    = self.request.query_params.get('month')
        year     = self.request.query_params.get('year')

        if date_str:
            try:
                return queryset.filter(date=date_str)
            except ValueError:
                pass

        if month:
            try:
                queryset = queryset.filter(date__month=int(month))
            except ValueError:
                pass

        if year:
            try:
                queryset = queryset.filter(date__year=int(year))
            except ValueError:
                pass
        else:
            queryset = queryset.filter(date__year=timezone.now().year)

        return queryset.order_by('-date')


# 5. Ажилчдын тухайн өдрийн ирцийг гаргах
class DailyAttendanceListAPI(generics.ListAPIView):
    serializer_class = DailyAttendanceSerializer

    def get_queryset(self):
        user            = self.request.user
        target_date_str = self.request.query_params.get('date')

        if target_date_str:
            try:
                target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                target_date = timezone.localdate()
        else:
            target_date = timezone.localdate()

        queryset = (
            User.objects
            .filter(organization=user.organization)
            .exclude(role='ADMIN')
        )

        return queryset.prefetch_related(
            models.Prefetch(
                'attendances',
                queryset=Attendance.objects.filter(date=target_date),
                to_attr='today_attendance',
            )
        ).order_by('first_name')


# 6. Ажилчдын ирцийн түүх харах (Admin/HR)
class AttendanceHistoryAPI(generics.ListAPIView):
    serializer_class   = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id  = self.request.query_params.get('user_id')
        date_str = self.request.query_params.get('date')
        month    = self.request.query_params.get('month')
        year     = self.request.query_params.get('year')

        if not user_id:
            return Attendance.objects.none()

        queryset = Attendance.objects.filter(user_id=user_id)

        if date_str:
            try:
                return queryset.filter(date=date_str).order_by('-date')
            except (ValueError, TypeError):
                pass

        if month:
            try:
                queryset = queryset.filter(date__month=int(month))
            except ValueError:
                pass

        if year:
            try:
                queryset = queryset.filter(date__year=int(year))
            except ValueError:
                queryset = queryset.filter(date__year=timezone.now().year)
        else:
            queryset = queryset.filter(date__year=timezone.now().year)

        return queryset.order_by('-date')