from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'  # Энэ нэр INSTALLED_APPS-тай ижил байх ёстой
    label = 'users'      # Энэ нь AUTH_USER_MODEL-д ашиглагдах богино нэр