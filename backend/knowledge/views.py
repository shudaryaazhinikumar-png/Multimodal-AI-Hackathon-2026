import logging
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.authentication import BearerOrTokenAuthentication
from .embeddings import get_embedding_service
from .models import KnowledgeDocument
from .serializers import KnowledgeDocumentSerializer
from .vectorstore import get_vectorstore

logger = logging.getLogger(__name__)


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def knowledge_search(request):
    """
    GET /api/knowledge/search?q=<query>
    Performs semantic vector search across materials owned by the authenticated user.
    """
    query = request.query_params.get("q", "").strip()

    if not query:
        return Response(
            {"error": "Query parameter 'q' is required and cannot be empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(query) > 1000:
        return Response(
            {"error": "Query is too long (maximum 1000 characters)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        limit_param = request.query_params.get("limit", "5")
        limit = min(max(int(limit_param), 1), 20)
    except (ValueError, TypeError):
        limit = 5

    material_id = request.query_params.get("material_id")
    if material_id:
        try:
            material_id = int(material_id)
        except (ValueError, TypeError):
            material_id = None

    try:
        # 1. Embed query vector
        embed_service = get_embedding_service()
        query_embedding = embed_service.embed_query(query)

        # 2. ChromaDB similarity search (strictly isolated to request.user.id)
        vectorstore = get_vectorstore()
        results = vectorstore.search(
            user_id=request.user.id,
            query_embedding=query_embedding,
            n_results=limit,
            material_id=material_id,
        )

        # Direct list response matching frontend knowledgeService contract
        return Response(results, status=status.HTTP_200_OK)

    except Exception:
        logger.exception("Search failed for user %s", request.user.id)
        return Response(
            {"error": "Search failed. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def document_detail(request, material_id):
    """
    GET /api/knowledge/documents/<material_id>
    Retrieves knowledge processing status and chunk details for a material.
    """
    doc = get_object_or_404(
        KnowledgeDocument,
        material__id=material_id,
        user=request.user,
    )
    serializer = KnowledgeDocumentSerializer(doc)
    return Response(serializer.data, status=status.HTTP_200_OK)
