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
from knowledge.pipeline import process_material
from knowledge.vectorstore import get_vectorstore
from .models import Material
from .serializers import MaterialSerializer

logger = logging.getLogger(__name__)


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def materials_list(request):
    """
    GET /api/materials
    """
    materials = Material.objects.filter(user=request.user)

    serializer = MaterialSerializer(
        materials,
        many=True,
        context={"request": request},
    )

    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def material_upload(request):
    """
    POST /api/materials/upload
    """
    serializer = MaterialSerializer(
        data=request.data,
        context={"request": request},
    )

    if not serializer.is_valid():
        return Response(
            {
                "error": "Validation failed.",
                "details": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    uploaded_file = request.FILES.get("file")

    material = serializer.save(
        user=request.user,
        file_size=uploaded_file.size if uploaded_file else 0,
        material_type=_get_material_type(uploaded_file),
    )

    # Process material through knowledge pipeline (extract, chunk, embed, store in ChromaDB)
    try:
        process_material(material)
    except Exception as e:
        logger.warning(f"Knowledge ingestion pipeline encountered error for material {material.id}: {e}")

    material.refresh_from_db()

    return Response(
        MaterialSerializer(
            material,
            context={"request": request},
        ).data,
        status=status.HTTP_201_CREATED,
    )


def _get_material_type(uploaded_file):
    if not uploaded_file:
        return "other"

    extension = uploaded_file.name.lower().rsplit(".", 1)[-1]

    if extension == "pdf":
        return "pdf"

    if extension in {"ppt", "pptx"}:
        return "ppt"

    if extension in {"mp4", "mov", "avi", "mkv", "webm"}:
        return "video"

    return "other"


@api_view(["DELETE"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def material_delete(request, material_id):
    material = get_object_or_404(
        Material,
        id=material_id,
        user=request.user,
    )

    # Delete ChromaDB vector entries for this material
    try:
        vectorstore = get_vectorstore()
        vectorstore.delete_material_chunks(user_id=request.user.id, material_id=material.id)
    except Exception as e:
        logger.warning(f"Error cleaning ChromaDB chunks for material {material_id}: {e}")

    material.delete()

    return Response(
        {
            "message": "Material deleted successfully."
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def material_reprocess(request, material_id):
    material = get_object_or_404(
        Material,
        id=material_id,
        user=request.user,
    )

    material.status = "processing"
    material.save(update_fields=["status", "updated_at"])

    # Re-run knowledge ingestion pipeline
    try:
        process_material(material)
    except Exception as e:
        logger.warning(f"Knowledge reprocessing failed for material {material.id}: {e}")

    material.refresh_from_db()

    return Response(
        MaterialSerializer(
            material,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )