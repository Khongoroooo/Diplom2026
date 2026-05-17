from django.urls import path
from .views import OrganizationCreateView, OrganizationListView

urlpatterns = [
    path('register/', OrganizationCreateView.as_view(), name='org-register'),
    path('list/', OrganizationListView.as_view(), name='org-list'),
]