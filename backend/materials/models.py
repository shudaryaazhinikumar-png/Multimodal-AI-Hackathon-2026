from django.contrib.auth.models import User
from django.db import models


class Material(models.Model):
    """
    Learning material uploaded by a student.
    """

    MATERIAL_TYPES = [
        ("pdf", "PDF"),
        ("ppt", "PowerPoint"),
        ("pptx", "PowerPoint"),
        ("video", "Video"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("uploaded", "Uploaded"),
        ("processing", "Processing"),
        ("processed", "Processed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="materials",
    )

    title = models.CharField(
        max_length=255,
    )

    file = models.FileField(
        upload_to="materials/%Y/%m/",
    )

    material_type = models.CharField(
        max_length=20,
        choices=MATERIAL_TYPES,
        default="other",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="uploaded",
    )

    file_size = models.PositiveBigIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title