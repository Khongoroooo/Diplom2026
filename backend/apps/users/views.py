from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdminUser
from .models import User
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer, UserSerializer

# Бүртгүүлэх View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# Нэвтрэх View (JWT)
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]