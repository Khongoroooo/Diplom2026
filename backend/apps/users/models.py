from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.hr.models import Department, Position

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        HR = "HR", "HR"
        MANAGER = "MANAGER", "Manager"
        EMPLOYEE = "EMPLOYEE", "Employee"

    email = models.EmailField(unique=True)
    department = models.ForeignKey(
        'hr.Department', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    position = models.ForeignKey(
        'hr.Position', 
        on_delete=models.SET_NULL, 
        null=True,)
    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.EMPLOYEE
    )

    phone_number = models.CharField(max_length=15, blank=True, null=True)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"