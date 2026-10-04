from rest_framework import serializers

from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
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

    def get_fileUrl(self, obj):
        request = self.context.get("request")

        if not obj.file:
            return None

        if request:
            return request.build_absolute_uri(obj.file.url)

        return obj.file.url