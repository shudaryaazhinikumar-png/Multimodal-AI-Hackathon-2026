from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .authentication import BearerOrTokenAuthentication
from .models import StudentProfile
from .serializers import (
    ProfileUpdateSerializer,
    SignupSerializer,
    StudentSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    """
    POST /api/auth/signup
    Registers a new student account and returns an auth token with profile details.
    """
    serializer = SignupSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {
                "error": "Validation failed.",
                "details": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            **StudentSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login
    Authenticates student credentials and returns an auth token with profile details.
    """
    if not isinstance(request.data, dict):
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email_raw = request.data.get("email")
    password = request.data.get("password")

    if not isinstance(email_raw, str) or not isinstance(password, str):
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = email_raw.lower().strip()

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    authenticated_user = authenticate(
        request=request,
        username=user.username,
        password=password,
    )

    if authenticated_user is None:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=authenticated_user)

    return Response(
        {
            "token": token.key,
            **StudentSerializer(authenticated_user).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    POST /api/auth/logout
    Revokes the current user's authentication token.
    """
    if isinstance(request.auth, Token):
        request.auth.delete()
    else:
        Token.objects.filter(user=request.user).delete()

    return Response(
        {"message": "Logged out successfully."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """
    GET /api/auth/me
    Returns current authenticated student information.
    """
    serializer = StudentSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    GET /api/auth/profile
    PATCH /api/auth/profile
    Retrieves or partially updates the current authenticated student's profile.
    """
    profile_obj, _ = StudentProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        serializer = StudentSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        serializer = ProfileUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation failed.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = serializer.validated_data
        if "education" in validated_data:
            profile_obj.education = validated_data["education"]
        if "learningGoal" in validated_data:
            profile_obj.learning_goal = validated_data["learningGoal"]
        if "avatar" in validated_data:
            profile_obj.avatar = validated_data["avatar"]

        profile_obj.save()

        return Response(
            StudentSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )