from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True) # Жишээ нь: 'unitel', 'mcs'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class BaseTenantModel(models.Model):
    organization = models.ForeignKey(
        'organizations.Organization', 
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_related",
        null=True,   # 1. Өмнөх датанууд алдаа заахгүй байхад тусална
        blank=True
    )

    class Meta:
        abstract = True