
from rest_framework import permissions

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        # Allow read permissions for all users.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Allow write permissions for the owner of the task or admin users.
        return obj.user == request.user or request.user.is_staff