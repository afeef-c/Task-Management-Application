from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'].is_anonymous:
            await self.close(code=4001)
        else:
            await self.channel_layer.group_add('tasks', self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('tasks', self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            await self.channel_layer.group_send(
                'tasks',
                {
                    'type': 'task_update',
                    'message': data
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))

    async def task_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
