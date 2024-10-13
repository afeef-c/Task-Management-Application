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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admins see all tasks, users see their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Task.objects.all().order_by('-created_at')
        return Task.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        if self.request.user.is_staff or self.request.user.is_superuser:
            user_id = self.request.data.get('assigned_user', None)
            if user_id:
                User = get_user_model()
                try:
                    user = User.objects.get(id=user_id)
                    task = serializer.save(user=user)
                except User.DoesNotExist:
                    raise ValidationError({"assigned_user": "Assigned user does not exist."})
            else:
                raise ValidationError({"assigned_user": "Assigned user ID must be provided."})
        else:
            task = serializer.save(user=self.request.user)

        # Send WebSocket message for task creation
        self.send_task_update('create', task)

    def perform_update(self, serializer):
        try:
            task = serializer.save()
            # Send WebSocket message for task update
            self.send_task_update('update', task)
        except Exception as e:
            raise ValidationError({"error": str(e)})

    def perform_destroy(self, instance):
        task_id = instance.id
        instance.delete()
        # Send WebSocket message for task deletion
        self.send_task_update('delete', task_id)

    def send_task_update(self, action, task):
        # Set up the channel layer for WebSocket communication
        channel_layer = get_channel_layer()

        # Prepare the WebSocket message
        if action != 'delete':
            user_data = UserSerializer(task.user).data
            message = {
                'type': f'task.{action}',
                'task': {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'user': user_data,  # Ensure this line is active
                    'created_at': task.created_at.isoformat(),
                    'updated_at': task.updated_at.isoformat(),
                    'due_date': task.due_date.isoformat() if task.due_date else None,
                    'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                }
            }
        else:
            message = {
                'type': 'task.deleted',
                'task_id': task_id  # Only need the task ID for deletion
            }

        # Broadcast the message to the WebSocket group 'task_updates'
        async_to_sync(channel_layer.group_send)('task_updates', {
            'type': 'task_update',
            'message': message
        })
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



