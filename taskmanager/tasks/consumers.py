import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser

class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']

        if user.is_anonymous:
            await self.close()

        # Join the user's group
        user_group = f"user_{user.id}"
        await self.channel_layer.group_add(user_group, self.channel_name)

        # Admins also join the 'admin_group'
        if user.is_staff or user.is_superuser:
            await self.channel_layer.group_add("admin_group", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        user = self.scope['user']

        # Leave the user's group
        user_group = f"user_{user.id}"
        await self.channel_layer.group_discard(user_group, self.channel_name)

        # Admins leave the 'admin_group'
        if user.is_staff or user.is_superuser:
            await self.channel_layer.group_discard("admin_group", self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        pass  # No need to handle messages from the client

    # Receive message from the channel layer
    async def task_update(self, event):
        message = event['message']

        # Send the task update to the WebSocket client
        await self.send(text_data=json.dumps(message))
