from django.urls import path
from .views import AttendanceHistoryAPI, GenerateQRTokenView, QRCheckInView, CheckOutView, MyAttendanceListView, DailyAttendanceListAPI

urlpatterns = [
    path('generate-qr/', GenerateQRTokenView.as_view(), name='generate-qr'),
    path('qr-check-in/', QRCheckInView.as_view(), name='qr-check-in'),
    path('check-out/', CheckOutView.as_view(), name='check-out'),
    path('my-history/', MyAttendanceListView.as_view(), name='attendance-history'),
    path('daily/', DailyAttendanceListAPI.as_view(), name='daily-attendance' ),
    path('history/', AttendanceHistoryAPI.as_view(), name='attendance-history'),
]