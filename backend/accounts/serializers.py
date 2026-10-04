from django.contrib.auth.models import User
from rest_framework import serializers

from .models import StudentProfile


class StudentSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    learningGoal = serializers.CharField(
        source="student_profile.learning_goal"
    )
    education = serializers.CharField(
        source="student_profile.education"
    )
    joinedDate = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "education",
            "learningGoal",
            "joinedDate",
            "avatar",
        ]

    def get_id(self, obj):
        return f"stu-{obj.id}"

    def get_name(self, obj):
        return obj.get_full_name()

    def get_joinedDate(self, obj):
        return obj.date_joined.strftime("%B %Y")

    def get_avatar(self, obj):
        name = obj.get_full_name().strip()

        if not name:
            return ""

        parts = name.split()

        if len(parts) == 1:
            return parts[0][:2].upper()

        return f"{parts[0][0]}{parts[-1][0]}".upper()


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )
    learningGoal = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        default="",
    )
    education = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def create(self, validated_data):
        name = validated_data.pop("name")
        learning_goal = validated_data.pop("learningGoal", "")
        education = validated_data.pop("education", "")

        parts = name.strip().split(maxsplit=1)

        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=first_name,
            last_name=last_name,
        )

        StudentProfile.objects.create(
            user=user,
            learning_goal=learning_goal,
            education=education,
            avatar="",
        )

        return user