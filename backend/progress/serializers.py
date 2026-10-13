from rest_framework import serializers

from .models import LearningProgress


class LearningProgressSerializer(serializers.ModelSerializer):
    material_title = serializers.CharField(
        source="material.title",
        read_only=True,
    )

    class Meta:
        model = LearningProgress
        fields = [
            "id",
            "activity_type",
            "topic",
            "score",
            "total_questions",
            "correct_answers",
            "accuracy",
            "mastery_level",
            "data",
            "material",
            "material_title",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AssessmentSubmitSerializer(serializers.Serializer):
    topic = serializers.CharField(max_length=255, required=False, default="General")
    score = serializers.FloatField(required=False, default=0.0)
    total_questions = serializers.IntegerField(required=False, default=0)
    correct_answers = serializers.IntegerField(required=False, default=0)
    accuracy = serializers.FloatField(required=False, default=None)
    material_id = serializers.IntegerField(required=False, allow_null=True, default=None)
    data = serializers.DictField(required=False, default=dict)
