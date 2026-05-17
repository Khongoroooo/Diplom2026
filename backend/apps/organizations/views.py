from rest_framework import generics, status
from rest_framework.response import Response
from .models import Organization
from .serializers import OrganizationSerializer, OrganizationRegistrationSerializer

# Байгууллага шинээр бүртгэх (Public байж болно)
class OrganizationCreateView(generics.CreateAPIView):
    serializer_class = OrganizationRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = serializer.save()
        return Response({
            "message": "Байгууллага болон админ амжилттай бүртгэгдлээ.",
            "organization": OrganizationSerializer(org).data
        }, status=status.HTTP_201_CREATED)

# Байгууллагуудын жагсаалт харах (Зөвхөн Супер Админд зориулсан байж болно)
class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer