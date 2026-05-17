from django.db import models
from apps.organizations.models import BaseTenantModel

class Department(BaseTenantModel):
    name = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class Position(BaseTenantModel):
    title = models.CharField(max_length=100, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="positions")

    def __str__(self):
        return f"{self.title}({self.department.name})"