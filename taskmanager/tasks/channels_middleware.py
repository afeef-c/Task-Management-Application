from urllib.parse import parse_qs
from channels.middleware.base import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        UntypedToken(token)  # Decode and validate token
        # Here you might want to add logic to get the user from the token
        decoded_data = UntypedToken(token)
        user = User.objects.get(id=decoded_data['user_id'])
        return user
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse query string
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get('token', None)

        if token:
            token = token[0]
            # Authenticate the user based on the token
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
