"""
Django settings for config project.

AI Personalized Learning Companion
Backend configuration.
"""

import os
import urllib.parse
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


# ============================================================
# BASE CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env (allowing .env to override shell defaults)
load_dotenv(BASE_DIR / ".env", override=True)


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-development-only",
)

DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "127.0.0.1,localhost,testserver",
    ).split(",")
    if host.strip()
]


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [
    # Django built-in applications
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party applications
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",

    # project applications
    "accounts",
    "materials",
    "knowledge",
    "tutor",
    "progress",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    # CORS must be before CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL CONFIGURATION
# ============================================================

ROOT_URLCONF = "config.urls"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# WSGI / ASGI
# ============================================================

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================
# DATABASE
# ============================================================

def configure_databases(debug: bool, database_url: str, base_dir: Path) -> dict:
    url = (database_url or "").strip()
    if url:
        try:
            parsed_db = urllib.parse.urlparse(url)
        except Exception:
            raise ImproperlyConfigured(
                "Invalid DATABASE_URL: unable to parse database URL."
            ) from None

        scheme = (parsed_db.scheme or "").lower()
        if scheme not in ("postgres", "postgresql"):
            raise ImproperlyConfigured(
                f"Invalid DATABASE_URL scheme '{scheme}'. Expected 'postgresql' or 'postgres'."
            )

        db_name = parsed_db.path.lstrip("/")
        if not db_name:
            raise ImproperlyConfigured(
                "Invalid DATABASE_URL: database name is required."
            )

        db_host = parsed_db.hostname or ""
        if not db_host:
            raise ImproperlyConfigured(
                "Invalid DATABASE_URL: database host is required."
            )

        try:
            db_port = parsed_db.port or 5432
        except ValueError:
            raise ImproperlyConfigured(
                "Invalid DATABASE_URL: port must be an integer between 1 and 65535."
            ) from None

        if not (1 <= db_port <= 65535):
            raise ImproperlyConfigured(
                "Invalid DATABASE_URL: port must be an integer between 1 and 65535."
            )

        return {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": urllib.parse.unquote(db_name),
                "USER": urllib.parse.unquote(parsed_db.username or ""),
                "PASSWORD": urllib.parse.unquote(parsed_db.password or ""),
                "HOST": db_host,
                "PORT": db_port,
            }
        }

    if not debug:
        raise ImproperlyConfigured(
            "DATABASE_URL environment variable is required when DJANGO_DEBUG=False."
        )

    return {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": base_dir / "db.sqlite3",
        }
    }


DATABASES = configure_databases(DEBUG, os.getenv("DATABASE_URL", ""), BASE_DIR)

CHROMA_PERSIST_DIRECTORY = os.getenv(
    "CHROMA_PERSIST_DIRECTORY",
    str(BASE_DIR / "chroma_db"),
)

# Minimum cosine relevance threshold for RAG retrieval filtering (0.0 - 1.0)
RAG_MIN_RELEVANCE_THRESHOLD = float(
    os.getenv("RAG_MIN_RELEVANCE_THRESHOLD", "0.65")
)


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


# ============================================================
# MEDIA FILES
# ============================================================

# Uploaded PDFs, PPTs, videos, etc.
MEDIA_URL = "media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "120/minute",
        "user": "1200/minute",
    },
}


# ============================================================
# CORS
# ============================================================

# React/Vite development server
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
    ).split(",")
    if origin.strip()
]


# ============================================================
# FILE UPLOAD LIMITS
# ============================================================

# Initial development limits.
# We can increase these when implementing material uploads.
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024


# ============================================================
# EMAIL
# ============================================================

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"