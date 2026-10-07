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
from .serializers import (
    MaterialSerializer,
    get_material_type_from_filename,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def materials_list(request):
    """
    GET /api/materials
    Returns the list of materials owned by the authenticated user.
    """
    materials = Material.objects.filter(user=request.user)

    serializer = MaterialSerializer(
        materials,
        many=True,
        context={"request": request},
    )

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def material_upload(request):
    """
    POST /api/materials/upload
    Handles uploading a study material (PDF, PPT, PPTX), saves the record,
    and runs synchronous knowledge ingestion.
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

    uploaded_file = serializer.validated_data["file"]
    material_type = get_material_type_from_filename(uploaded_file.name)

    material = serializer.save(
        user=request.user,
        file_size=uploaded_file.size,
        material_type=material_type,
    )

    # Process material through knowledge pipeline (extract, chunk, embed, store in ChromaDB)
    try:
        process_material(material)
    except Exception as e:
        logger.exception(
            "Knowledge ingestion pipeline encountered error for material %s: %s",
            material.id,
            e,
        )

    material.refresh_from_db()

    return Response(
        MaterialSerializer(
            material,
            context={"request": request},
        ).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "DELETE"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def material_detail(request, material_id):
    """
    GET /api/materials/<material_id>
    DELETE /api/materials/<material_id>
    Retrieves or deletes a specific material owned by the authenticated user.
    """
    material = get_object_or_404(
        Material,
        id=material_id,
        user=request.user,
    )

    if request.method == "GET":
        return Response(
            MaterialSerializer(
                material,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )

    # DELETE
    # Delete ChromaDB vector entries for this material
    try:
        vectorstore = get_vectorstore()
        vectorstore.delete_material_chunks(
            user_id=request.user.id,
            material_id=material.id,
        )
    except Exception as e:
        logger.warning(
            "Error cleaning ChromaDB chunks for material %s: %s",
            material_id,
            e,
        )

    material.delete()

    return Response(
        {"message": "Material deleted successfully."},
        status=status.HTTP_200_OK,
    )


# Backward-compatibility alias
material_delete = material_detail


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def material_reprocess(request, material_id):
    """
    POST /api/materials/<material_id>/reprocess
    Re-runs knowledge ingestion pipeline for the specified material.
    """
    material = get_object_or_404(
        Material,
        id=material_id,
        user=request.user,
    )

    # Re-run knowledge ingestion pipeline (sets processing status, re-chunks, re-embeds)
    try:
        process_material(material)
    except Exception as e:
        logger.exception(
            "Knowledge reprocessing failed for material %s: %s",
            material.id,
            e,
        )

    material.refresh_from_db()

    return Response(
        MaterialSerializer(
            material,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )