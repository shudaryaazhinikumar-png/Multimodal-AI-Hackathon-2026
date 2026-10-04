from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import SignupSerializer, StudentSerializer


@api_view(["POST"])
def signup(request):
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
def login(request):
    email = request.data.get("email", "").lower().strip()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {
                "error": "Email and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {
                "error": "Invalid email or password."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = authenticate(
        request=request,
        username=user.username,
        password=password,
    )

    if user is None:
        return Response(
            {
                "error": "Invalid email or password."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            **StudentSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def logout(request):
    token_key = request.auth

    if token_key:
        token_key.delete()

    return Response(
        {
            "message": "Logged out successfully."
        },
        status=status.HTTP_200_OK,
    )