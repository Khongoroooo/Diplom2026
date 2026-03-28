from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.hr.models import Position
from .models import User

# 1. Бүртгэлийн Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # React-аас ирэх position-ийн ID-г хүлээж авна
    position = serializers.PrimaryKeyRelatedField(
        queryset=Position.objects.all(), 
        required=True
    )

    class Meta:
        model = User
        # fields дотор position болон department-ийг заавал оруулна
        fields = (
            'first_name', 'last_name', 'username', 'password', 
            'email', 'role', 'phone_number', 'position', 'department'
        )
        # department-ийг React-аас явуулах шаардлагагүй тул optional болгоно
        extra_kwargs = {
            'department': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        # 1. Сонгосон position объектыг авна
        position_obj = validated_data.get('position')
        
        # 2. Position-оор дамжуулж Department-ийг нь олно
        # Энэ нь 'hr.Position' модельд 'department' гэсэн FK байгаа гэж үзэж байна
        if position_obj and hasattr(position_obj, 'department'):
            validated_data['department'] = position_obj.department
            
        # 3. Хэрэглэгчийг үүсгэх (password-ийг hash-лахын тулд create_user ашиглана)
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
    position_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = User    
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number',  'position_name', 'department_name', 'role')

    def get_position_name(self, obj):
        if obj.position:
            return obj.position.title
        return None

    def get_department_name(self, obj):
        # User модел дээр өөрөө department байгаа тул шууд авч болно
        if obj.department:
            return obj.department.name
        # Эсвэл position-оор дамжиж авах бол:
        if obj.position and obj.position.department:
            return obj.position.department.name
        return None