from rest_framework import serializers

from .models import TutorMessage


class TutorChatRequestSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=1000, trim_whitespace=True)
    action = serializers.CharField(
        max_length=80,
        required=False,
        allow_blank=True,
        allow_null=True,
    )


class TutorMessageSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = TutorMessage
        fields = ["id", "role", "content", "sources", "timestamp"]

    def get_id(self, obj):
        return f"tutor-{obj.pk}"
