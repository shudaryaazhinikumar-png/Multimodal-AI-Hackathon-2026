from django.conf import settings
from django.db import models


class TutorMessage(models.Model):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("ai", "AI Tutor"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tutor_messages",
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.role} tutor message for user {self.user_id}"
