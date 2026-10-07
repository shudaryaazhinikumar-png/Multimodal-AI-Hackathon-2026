from pathlib import Path
from django.conf import settings
from rest_framework import serializers

from .models import Material

SUPPORTED_EXTENSIONS = {
    ".pdf": "pdf",
    ".ppt": "ppt",
    ".pptx": "ppt",
}

VIDEO_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
}


def get_material_type_from_filename(filename: str) -> str:
    """
    Determines material_type from file extension:
    .pdf -> "pdf"
    .ppt -> "ppt"
    .pptx -> "ppt"
    """
    ext = Path(filename).suffix.lower()
    return SUPPORTED_EXTENSIONS.get(ext, "other")


class MaterialSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    file = serializers.FileField(
        required=True,
    )
    fileUrl = serializers.SerializerMethodField()
    materialType = serializers.CharField(
        source="material_type",
        read_only=True,
    )
    fileSize = serializers.IntegerField(
        source="file_size",
        read_only=True,
    )
    createdAt = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )
    updatedAt = serializers.DateTimeField(
        source="updated_at",
        read_only=True,
    )

    class Meta:
        model = Material
        fields = [
            "id",
            "title",
            "file",
            "fileUrl",
            "materialType",
            "status",
            "fileSize",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = [
            "id",
            "fileUrl",
            "materialType",
            "status",
            "fileSize",
            "createdAt",
            "updatedAt",
        ]

    def validate_file(self, value):
        if not value:
            raise serializers.ValidationError("A file is required.")

        # Check empty file
        if value.size == 0:
            raise serializers.ValidationError("The uploaded file is empty.")

        # Check maximum file size
        max_size = getattr(settings, "FILE_UPLOAD_MAX_MEMORY_SIZE", 50 * 1024 * 1024)
        if value.size > max_size:
            max_mb = max_size // (1024 * 1024)
            raise serializers.ValidationError(
                f"File size exceeds maximum allowed limit ({max_mb} MB)."
            )

        filename = getattr(value, "name", "") or ""
        ext = Path(filename).suffix.lower()

        if not ext:
            raise serializers.ValidationError(
                "The uploaded file must have a valid extension (.pdf, .ppt, .pptx)."
            )

        if ext in VIDEO_EXTENSIONS:
            raise serializers.ValidationError(
                f"Video format '{ext}' is not supported. Supported formats are PDF (.pdf) and PowerPoint (.pptx, .ppt)."
            )

        if ext not in SUPPORTED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Unsupported file format '{ext}'. Supported formats are PDF (.pdf) and PowerPoint (.pptx, .ppt)."
            )

        return value

    def validate(self, attrs):
        # Determine title if omitted or blank
        title = attrs.get("title")
        if not title or not title.strip():
            file_obj = attrs.get("file")
            if file_obj and hasattr(file_obj, "name") and file_obj.name:
                attrs["title"] = file_obj.name
            elif self.instance and self.instance.title:
                attrs["title"] = self.instance.title
            else:
                attrs["title"] = "Untitled Material"
        else:
            attrs["title"] = title.strip()

        return attrs

    def get_fileUrl(self, obj):
        request = self.context.get("request")

        if not obj.file:
            return None

        try:
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        except Exception:
            return None