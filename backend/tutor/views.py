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
from ai.tutor_service import (
    TutorGenerationError,
    TutorNoMaterialError,
    TutorRetrievalError,
    generate_tutor_response,
)
from .models import TutorMessage
from .serializers import TutorChatRequestSerializer, TutorMessageSerializer

logger = logging.getLogger(__name__)


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def tutor_chat(request):
    """
    POST /api/tutor/chat
    Receives a student question, performs semantic search over the student's study materials,
    generates a grounded tutor explanation using LLM, and persists chat history.
    """
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
        response_data = generate_tutor_response(
            user_id=request.user.id,
            question=content,
        )
    except TutorNoMaterialError:
        return Response(
            {
                "code": "no_relevant_material",
                "error": "No relevant study material was found. Upload or process materials, then try again.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    except TutorRetrievalError:
        logger.exception("Tutor retrieval failed for authenticated user %s", request.user.id)
        return Response(
            {
                "code": "retrieval_unavailable",
                "error": "Study material search is temporarily unavailable. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except TutorGenerationError:
        logger.exception("Tutor LLM generation failed for authenticated user %s", request.user.id)
        return Response(
            {
                "code": "generation_unavailable",
                "error": "AI tutor answer generation is temporarily unavailable. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception:
        logger.exception("Unexpected error in tutor_chat for authenticated user %s", request.user.id)
        return Response(
            {
                "code": "generation_unavailable",
                "error": "AI tutor answer generation is temporarily unavailable. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    answer = response_data["answer"]
    sources = response_data["sources"]

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
    """
    GET /api/tutor/history
    Returns the chronological conversation history for the authenticated student.
    """
    messages = TutorMessage.objects.filter(user=request.user).order_by("created_at", "id")
    return Response(
        TutorMessageSerializer(messages, many=True).data,
        status=status.HTTP_200_OK,
    )

