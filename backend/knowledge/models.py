from django.contrib.auth.models import User
from django.db import models

from materials.models import Material


class KnowledgeDocument(models.Model):
    """
    Represents the processed knowledge representation of a learning Material.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("processed", "Processed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="knowledge_documents",
    )

    material = models.OneToOneField(
        Material,
        on_delete=models.CASCADE,
        related_name="knowledge_document",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    extracted_text = models.TextField(
        blank=True,
        default="",
    )

    chunk_count = models.PositiveIntegerField(
        default=0,
    )

    embedding_model = models.CharField(
        max_length=100,
        default="all-MiniLM-L6-v2",
    )

    error_message = models.TextField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        app_label = "knowledge"
        ordering = ["-created_at"]

    def __str__(self):
        return f"KnowledgeDocument for {self.material.title} ({self.status})"


class KnowledgeChunk(models.Model):
    """
    Represents an extracted and vectorized text chunk from a KnowledgeDocument.
    """

    document = models.ForeignKey(
        KnowledgeDocument,
        on_delete=models.CASCADE,
        related_name="chunks",
    )

    chunk_index = models.PositiveIntegerField(
        default=0,
    )

    text = models.TextField()

    page_number = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    slide_number = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        app_label = "knowledge"
        ordering = ["document", "chunk_index"]
        unique_together = [("document", "chunk_index")]

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.material.title}"
