from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class Position(models.Model):
    title = models.CharField(max_length=100, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="positions")

    def __str__(self):
        return f"{self.title}({self.department.name})"