# tasks/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status','user', 'created_at', 'updated_at', 'due_date', 'completed_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']


class UserSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True) 

    class Meta:
        model = User
        fields = ['id', 'username', 'is_staff', 'is_superuser', 'tasks']  