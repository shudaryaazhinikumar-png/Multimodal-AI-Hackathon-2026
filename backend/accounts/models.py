from django.contrib.auth.models import User
from django.db import models


class StudentProfile(models.Model):
    """
    Learning-specific profile for an authenticated student.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )

    education = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    learning_goal = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    avatar = models.CharField(
        max_length=10,
        blank=True,
        default="",
    )

    def __str__(self):
        return self.user.email or self.user.username