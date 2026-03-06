from django.urls import path
from .views import RegisterView, MyTokenObtainPairView, UserDeleteView, UserListView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('list/', UserListView.as_view(), name='user_list'), 
    path('<int:pk>/delete/', UserDeleteView.as_view(), name='user_delete')
    
]