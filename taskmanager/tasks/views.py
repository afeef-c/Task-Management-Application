# tasks/views.py

from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth.models import User
from .models import Task
from .serializers import TaskSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsOwnerOrAdminOrReadOnly
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async


# User Registration View
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if username is None or password is None:
        return Response({'error': 'Please provide both username and password'},
                        status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'},
                        status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password)
    user.save()
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

# User Detail View (Optional)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UsersView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminOrReadOnly]

    def get_queryset(self):
        # Check if the user is an admin
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Task.objects.all().order_by('-created_at')
        return Task.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Check if the user is an admin
        if self.request.user.is_staff or self.request.user.is_superuser:
            user_id = self.request.data.get('assigned_user', None)  # Get the assigned user ID from the request
            if user_id:
                User = get_user_model()
                try:
                    user = User.objects.get(id=user_id)
                    task = serializer.save(user=user)  # Save the task with the assigned user
                except User.DoesNotExist:
                    raise ValidationError({"assigned_user": "Assigned user does not exist."})
            else:
                raise ValidationError({"assigned_user": "Assigned user ID must be provided."})
        else:
            # For regular users, save the task with the authenticated user
            task = serializer.save(user=self.request.user)

        # Notify WebSocket consumers about the new task
        self.send_task_update(task, 'created')

    def perform_update(self, serializer):
        task = serializer.save()  # Save the updated task

        # Notify WebSocket consumers about the task update
        self.send_task_update(task, 'updated')

    def perform_destroy(self, instance):
        # Notify WebSocket consumers about task deletion
        self.send_task_update(instance, 'deleted')

        # Then delete the task
        instance.delete()

    @database_sync_to_async
    def send_task_update(self, task, action):
        # Get the channel layer
        channel_layer = get_channel_layer()

        # Prepare the task data to send via WebSocket
        task_data = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'completed': task.completed,
            'user': task.user.username,
            'action': action,  # 'created', 'updated', or 'deleted'
        }

        # Send task update to WebSocket group 'tasks'
        async_to_sync(channel_layer.group_send)(
            'tasks',
            {
                'type': 'task_update',  # This corresponds to the 'task_update' method in TaskConsumer
                'message': task_data
            }
        )

@api_view(['GET'])
def task_statistics(request):
    # Check if the user is a superuser
    if request.user.is_superuser:
        # If the user is a superuser, get all tasks
        completed_tasks = Task.objects.filter(status='DONE').count()
        pending_tasks = Task.objects.filter(status='TODO').count()
        in_progress_tasks = Task.objects.filter(status='IN_PROGRESS').count()
        overdue_tasks = Task.objects.filter(status='OVERDUE').count()
    else:
        # If the user is not a superuser, filter tasks by user
        completed_tasks = Task.objects.filter(status='DONE', user=request.user).count()
        pending_tasks = Task.objects.filter(status='TODO', user=request.user).count()
        in_progress_tasks = Task.objects.filter(status='IN_PROGRESS', user=request.user).count()
        overdue_tasks = Task.objects.filter(status='OVERDUE', user=request.user).count()
        
    data = {
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'in_progress_tasks': in_progress_tasks,
        'overdue_tasks': overdue_tasks,
        
    }

    return Response(data)



