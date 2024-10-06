from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
        ('OVERDUE', 'Overdue')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, related_name='tasks', on_delete=models.CASCADE)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # If task is DONE, set the completion date if not already set
        if self.status == 'DONE' and self.completed_at is None:
            self.completed_at = timezone.now()
        
        # Check if due_date has passed and the task is not done
        if self.due_date and self.due_date < timezone.now().date() and self.status != 'DONE':
            self.status = 'OVERDUE'
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
