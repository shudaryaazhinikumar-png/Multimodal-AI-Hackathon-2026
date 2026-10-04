import logging

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.authentication import BearerOrTokenAuthentication
from knowledge.embeddings import get_embedding_service
from knowledge.vectorstore import get_vectorstore
from .models import TutorMessage
from .serializers import TutorChatRequestSerializer, TutorMessageSerializer

logger = logging.getLogger(__name__)


def _to_chat_sources(results):
    sources = []
    for result in results:
        source_type = result.get("sourceType", "other")
        if source_type not in {"pdf", "ppt", "video", "other"}:
            source_type = "other"

        source = {
            "id": str(result["id"]),
            "title": result.get("sourceName") or result.get("title") or "Study material",
            "type": source_type,
            "snippet": result["text"],
        }
        for field in ("page", "slide", "timestamp", "relevance", "materialId", "documentId", "chunkIndex"):
            value = result.get(field)
            if value is not None:
                source[field] = value
        sources.append(source)
    return sources


def _retrieval_only_answer(sources):
    excerpts = []
    for source in sources:
        location = ""
        if source.get("page") is not None:
            location = f" — page {source['page']}"
        elif source.get("slide") is not None:
            location = f" — slide {source['slide']}"
        excerpts.append(f"**{source['title']}{location}**\n\n{source['snippet']}")

    return (
        "Answer generation is not configured. These are the passages retrieved "
        "from your materials; they are source excerpts, not a generated explanation:\n\n"
        + "\n\n".join(excerpts)
    )


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def tutor_chat(request):
    serializer = TutorChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {
                "code": "invalid_message",
                "error": "Enter a message of up to 1000 characters.",
                "details": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    content = serializer.validated_data["content"]

    try:
        query_embedding = get_embedding_service().embed_query(content)
        results = get_vectorstore().search(
            user_id=request.user.id,
            query_embedding=query_embedding,
            n_results=5,
        )
    except Exception:
        logger.exception("Tutor retrieval failed for authenticated user %s", request.user.id)
        return Response(
            {
                "code": "retrieval_unavailable",
                "error": "Study material search is temporarily unavailable. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if not results:
        return Response(
            {
                "code": "no_relevant_material",
                "error": "No relevant study material was found. Upload or process materials, then try again.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    sources = _to_chat_sources(results)
    if not sources:
        return Response(
            {
                "code": "no_relevant_material",
                "error": "No relevant study material was found. Upload or process materials, then try again.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    answer = _retrieval_only_answer(sources)
    with transaction.atomic():
        TutorMessage.objects.create(
            user=request.user,
            role="student",
            content=content,
        )
        response_message = TutorMessage.objects.create(
            user=request.user,
            role="ai",
            content=answer,
            sources=sources,
        )

    return Response(
        TutorMessageSerializer(response_message).data,
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def tutor_history(request):
    messages = TutorMessage.objects.filter(user=request.user).order_by("created_at", "id")
    return Response(
        TutorMessageSerializer(messages, many=True).data,
        status=status.HTTP_200_OK,
    )
