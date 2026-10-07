from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import StudentProfile


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializes a User and their StudentProfile into the frontend-compatible
    student representation.
    """

    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    learningGoal = serializers.SerializerMethodField()
    education = serializers.SerializerMethodField()
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

    def get_learningGoal(self, obj):
        try:
            return obj.student_profile.learning_goal
        except (StudentProfile.DoesNotExist, AttributeError):
            return ""

    def get_education(self, obj):
        try:
            return obj.student_profile.education
        except (StudentProfile.DoesNotExist, AttributeError):
            return ""

    def get_joinedDate(self, obj):
        if obj.date_joined:
            return obj.date_joined.strftime("%B %Y")
        return ""

    def get_avatar(self, obj):
        try:
            profile = obj.student_profile
            if profile.avatar:
                return profile.avatar
        except (StudentProfile.DoesNotExist, AttributeError):
            pass

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

    def validate_name(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Name cannot be blank.")
        return trimmed

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def create(self, validated_data):
        with transaction.atomic():
            name = validated_data.pop("name").strip()
            learning_goal = validated_data.pop("learningGoal", "")
            education = validated_data.pop("education", "")

            parts = name.split(maxsplit=1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

            email = validated_data["email"].lower().strip()
            password = validated_data["password"]

            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
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


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Validates partial profile updates.
    Only allows modifying StudentProfile fields: education, learningGoal, avatar.
    """

    education = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    learningGoal = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    avatar = serializers.CharField(
        max_length=10,
        required=False,
        allow_blank=True,
    )