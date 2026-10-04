from django.contrib import admin

from .models import KnowledgeChunk, KnowledgeDocument


@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display = ["id", "material", "user", "status", "chunk_count", "embedding_model", "created_at"]
    list_filter = ["status", "embedding_model", "created_at"]
    search_fields = ["material__title", "user__username", "user__email"]


@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display = ["id", "document", "chunk_index", "page_number", "slide_number", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["text", "document__material__title"]
