from rest_framework import serializers

from .models import KnowledgeChunk, KnowledgeDocument


class KnowledgeChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeChunk
        fields = [
            "id",
            "chunk_index",
            "text",
            "page_number",
            "slide_number",
            "metadata",
            "created_at",
        ]


class KnowledgeDocumentSerializer(serializers.ModelSerializer):
    chunks = KnowledgeChunkSerializer(many=True, read_only=True)
    materialTitle = serializers.CharField(source="material.title", read_only=True)
    materialType = serializers.CharField(source="material.material_type", read_only=True)

    class Meta:
        model = KnowledgeDocument
        fields = [
            "id",
            "material",
            "materialTitle",
            "materialType",
            "status",
            "chunk_count",
            "embedding_model",
            "error_message",
            "created_at",
            "updated_at",
            "chunks",
        ]
