
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import TaskSerializer

channel_layer = get_channel_layer()

@receiver(post_save, sender=Task)
def task_saved(sender, instance, created, **kwargs):
    serializer = TaskSerializer(instance)
    data = serializer.data
    group_name = f"user_{instance.user.id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'task_update',
            'task': data
        }
    )

@receiver(post_delete, sender=Task)
def task_deleted(sender, instance, **kwargs):
    data = {
        'id': instance.id,
        'deleted': True
    }
    group_name = f"user_{instance.user.id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'task_update',
            'task': data
        }
    )