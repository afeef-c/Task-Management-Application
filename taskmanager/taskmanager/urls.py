# task_manager/urls.py

from django.contrib import admin
from django.urls import path, include
from tasks.views import UsersView, register,CurrentUserView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', register, name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/profile/', CurrentUserView.as_view(), name='profile'),
    path('api/users_list/', UsersView.as_view(), name='users'),
    
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # For obtaining JWT
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # For refreshing JWT
    path('api/', include('tasks.urls')),  # Include tasks URLs
]
