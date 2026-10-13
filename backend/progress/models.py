from django.contrib.auth.models import User
from django.db import models

from materials.models import Material


class LearningProgress(models.Model):
    """
    Stores student quiz attempts, assessment sessions, topic mastery,
    and progress metrics in the relational database.
    """

    ACTIVITY_CHOICES = [
        ("quiz", "Quiz"),
        ("assessment", "Assessment"),
        ("revision", "Revision"),
        ("reading", "Reading"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="learning_progress",
    )
    material = models.ForeignKey(
        Material,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="progress_records",
    )
    activity_type = models.CharField(
        max_length=50,
        choices=ACTIVITY_CHOICES,
        default="assessment",
    )
    topic = models.CharField(
        max_length=255,
        blank=True,
        default="General",
    )
    score = models.FloatField(default=0.0)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    mastery_level = models.FloatField(default=0.0)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Learning progress records"

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.topic} ({self.score}%)"
