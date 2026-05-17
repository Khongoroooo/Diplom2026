from rest_framework import serializers
from .models import Organization
from apps.users.models import User

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'created_at']

class OrganizationRegistrationSerializer(serializers.Serializer):
    # Байгууллагын мэдээлэл
    org_name = serializers.CharField(max_length=255)
    org_slug = serializers.SlugField()
    
    # Тухайн байгууллагын анхны Админ хэрэглэгчийн мэдээлэл
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True)
    admin_first_name = serializers.CharField(max_length=100)
    admin_last_name = serializers.CharField(max_length=100)

    def create(self, validated_data):
        # 1. Байгууллагыг үүсгэх
        org = Organization.objects.create(
            name=validated_data['org_name'],
            slug=validated_data['org_slug']
        )
        
        # 2. Админ хэрэглэгчийг үүсгэх
        user = User.objects.create_user(
            email=validated_data['admin_email'],
            password=validated_data['admin_password'],
            first_name=validated_data['admin_first_name'],
            last_name=validated_data['admin_last_name'],
            username=validated_data['admin_email'], # эсвэл өөр логик
            organization=org,
            role='ADMIN' # User модель дээрх Role-оос ADMIN-ыг онооно
        )
        
        return org