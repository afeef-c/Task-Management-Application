# tasks/urls.py

from django.urls import path, include
from rest_framework import routers
from .views import TaskViewSet, UserViewSet

router = routers.DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
