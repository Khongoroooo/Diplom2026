from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

# 1. Бүртгэлийн Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'phone_number')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# 2. Нэвтрэх үед токен дотор Role-ийг хавсаргах Serializer
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Frontend-д зориулж нэмэлт мэдээлэл хавсаргах
        token['role'] = user.role
        token['email'] = user.email
        return token
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'is_active','phone_number')