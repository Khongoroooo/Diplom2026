from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.hr.models import Position
from .models import User

# 1. Бүртгэлийн Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    position = serializers.PrimaryKeyRelatedField(
        queryset=Position.objects.all(), 
        required=True
    )

    class Meta:
        model = User
        # 'organization' талбарыг fields-д заавал нэмнэ
        fields = (
            'first_name', 'last_name', 'username', 'password', 
            'email', 'role', 'phone_number', 'position', 'department', 'organization'
        )
        extra_kwargs = {
            'department': {'required': False, 'allow_null': True},
            'organization': {'required': False, 'allow_null': True} # Энд илгээх шаардлагагүй тул optional
        }

    def create(self, validated_data):
        # 1. View-ээс ирсэн request-ийг context-оос авна
        request = self.context.get('request')
        
        # 2. Нэвтэрсэн хэрэглэгчийн (Админы) байгууллагыг шинэ ажилтанд оноох
        if request and hasattr(request, 'user') and request.user.organization:
            validated_data['organization'] = request.user.organization
        
        # 3. Сонгосон position-оор дамжуулж Department-ийг оноох
        position_obj = validated_data.get('position')
        if position_obj and hasattr(position_obj, 'department'):
            validated_data['department'] = position_obj.department
            
        # 4. Хэрэглэгчийг үүсгэх (create_user ашигласнаар нууц үг зөв hash-лагдана)
        user = User.objects.create_user(**validated_data)
        return user

# 2. Нэвтрэх үед токен дотор Role болон Org хавсаргах Serializer
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['username'] = user.username
        
        if user.organization:
            token['organization_id'] = user.organization.id
            token['organization_name'] = user.organization.name
        else:
            token['organization_id'] = None
            token['organization_name'] = None
        return token

# 3. Хэрэглэгчийн мэдээлэл харуулах Serializer
class UserSerializer(serializers.ModelSerializer):
    position_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = User    
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'position_name', 'department_name', 'role', 'organization')

    def get_position_name(self, obj):
        return obj.position.title if obj.position else None

    def get_department_name(self, obj):
        if obj.department:
            return obj.department.name
        if obj.position and obj.position.department:
            return obj.position.department.name
        return None