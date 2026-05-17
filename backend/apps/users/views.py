from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdminUser, IsHRUser
from .models import User
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer, UserSerializer

# Бүртгүүлэх View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Аюулгүй байдлын үүднээс AllowAny-г Authenticated болгож, Admin эсвэл HR эрхтэй болгох хэрэгтэй
    permission_classes = [permissions.IsAuthenticated, IsAdminUser |IsHRUser ] 
    serializer_class = RegisterSerializer
# Нэвтрэх View (JWT)
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # 1. Хэрэв System Admin (Superuser) бол бүгдийг харуулна
        if user.is_superuser and not user.organization:
            return User.objects.all()

        # 2. Зөвхөн өөрийн байгууллагын хэрэглэгчдийг шүүх
        queryset = User.objects.filter(organization=user.organization)

        # 3. АДМИН-ЫГ НУУХ ХЭСЭГ:
        # Энд 'ADMIN' гэдэг нь таны User модел дээрх Role.ADMIN-ы утгатай (ADMIN) таарч байх ёстой
        queryset = queryset.exclude(role='ADMIN')
        
        return queryset
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]

class UserUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    permission_classes = [IsAdminUser]