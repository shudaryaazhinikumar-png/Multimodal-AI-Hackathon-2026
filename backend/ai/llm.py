"""
Configurable LLM provider abstraction for the AI Study Companion.
Supports Google Gemini, OpenAI, Groq, and OpenAI-compatible providers
with transient retry, exponential backoff, and robust error classification.
"""

import json
import logging
import os
import time
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, Optional, Set

from django.conf import settings

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Base exception for LLM service operations."""
    pass


class LLMConfigError(LLMError):
    """Raised when the LLM service is misconfigured or missing credentials."""
    pass


class LLMAuthError(LLMConfigError):
    """Raised when authentication with the LLM provider fails (HTTP 401/403)."""
    pass


class LLMGenerationError(LLMError):
    """Base exception for text generation failures from the LLM provider."""
    pass


class LLMTransientError(LLMGenerationError):
    """Raised for transient provider errors that may succeed upon retry (HTTP 429, 503, 500, etc.)."""
    pass


class LLMRateLimitError(LLMTransientError):
    """Raised when the LLM provider rate limit / quota is exceeded (HTTP 429)."""
    pass


class LLMUnavailableError(LLMTransientError):
    """Raised when the LLM provider is temporarily overloaded or unavailable (HTTP 503)."""
    pass


class LLMInvalidRequestError(LLMGenerationError):
    """Raised for client-side request errors such as 400 Bad Request or 404 Model Not Found."""
    pass


class BaseLLMService(ABC):
    """
    Abstract interface for LLM completion providers.
    """

    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generates a completion string for the given prompt.
        """
        pass


class GeminiLLMService(BaseLLMService):
    """
    Google Gemini REST API implementation with transient retry and exponential backoff.
    """

    TRANSIENT_STATUS_CODES: Set[int] = {429, 500, 502, 503, 504}

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 30,
        max_retries: int = 3,
        initial_backoff: float = 1.0,
        sleep_func: Callable[[float], None] = time.sleep,
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")
        self.model = (
            model
            or os.getenv("AI_MODEL")
            or getattr(settings, "AI_MODEL", "gemini-3.8-flash")
        )
        self.timeout = timeout
        self.max_retries = max(1, max_retries)
        self.initial_backoff = initial_backoff
        self.sleep_func = sleep_func

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            raise LLMConfigError("Gemini API key is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        contents: list[Dict[str, Any]] = [
            {
                "parts": [{"text": prompt}]
            }
        ]

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048,
            },
        }

        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    resp_data = json.loads(response.read().decode("utf-8"))

                candidates = resp_data.get("candidates", [])
                if not candidates:
                    raise LLMGenerationError("No candidates returned from Gemini.")

                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts or not parts[0].get("text"):
                    raise LLMGenerationError("Empty text response returned from Gemini.")

                return parts[0]["text"]

            except urllib.error.HTTPError as e:
                code = e.code
                error_body = ""
                try:
                    error_body = e.read().decode("utf-8")
                except Exception:
                    pass

                if code in (401, 403):
                    logger.error("Gemini authentication failed (HTTP %s).", code)
                    raise LLMAuthError(f"Gemini authentication failed with status {code}.") from None
                elif code in (400, 404):
                    logger.error("Gemini invalid request (HTTP %s).", code)
                    raise LLMInvalidRequestError(f"Gemini API request invalid (HTTP {code}).") from None
                elif code == 429:
                    last_error = LLMRateLimitError(f"Gemini rate limit exceeded (HTTP 429).")
                elif code == 503:
                    last_error = LLMUnavailableError(f"Gemini service temporarily unavailable (HTTP 503).")
                elif code in self.TRANSIENT_STATUS_CODES:
                    last_error = LLMTransientError(f"Gemini transient server error (HTTP {code}).")
                else:
                    logger.error("Gemini request failed with HTTP %s.", code)
                    raise LLMGenerationError(f"Gemini API request failed with status {code}.") from None

                if attempt < self.max_retries and code in self.TRANSIENT_STATUS_CODES:
                    backoff = self.initial_backoff * (2 ** (attempt - 1))
                    logger.warning(
                        "Gemini request failed with HTTP %s; retrying (attempt %d/%d) in %.1fs...",
                        code,
                        attempt,
                        self.max_retries,
                        backoff,
                    )
                    self.sleep_func(backoff)
                else:
                    logger.error("Gemini request failed after %d attempt(s) with HTTP %s.", attempt, code)
                    raise last_error from None

            except (KeyError, IndexError, json.JSONDecodeError) as e:
                logger.error("Failed to parse Gemini response: %s", type(e).__name__)
                raise LLMGenerationError("Invalid response structure from Gemini API.") from None
            except (LLMConfigError, LLMAuthError, LLMInvalidRequestError, LLMGenerationError):
                raise
            except Exception as e:
                logger.error("Gemini connection error on attempt %d/%d: %s", attempt, self.max_retries, type(e).__name__)
                last_error = LLMGenerationError(f"Failed to communicate with Gemini API: {type(e).__name__}")
                if attempt < self.max_retries:
                    backoff = self.initial_backoff * (2 ** (attempt - 1))
                    self.sleep_func(backoff)
                else:
                    raise last_error from None

        if last_error:
            raise last_error from None
        raise LLMGenerationError("Gemini generation failed after retries.")


class OpenAILLMService(BaseLLMService):
    """
    OpenAI-compatible REST API implementation (works with OpenAI, Groq, OpenRouter, etc.)
    with transient retry and exponential backoff.
    """

    TRANSIENT_STATUS_CODES: Set[int] = {429, 500, 502, 503, 504}

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: int = 30,
        max_retries: int = 3,
        initial_backoff: float = 1.0,
        sleep_func: Callable[[float], None] = time.sleep,
    ):
        self.api_key = (
            api_key
            or os.getenv("OPENAI_API_KEY")
            or os.getenv("GROQ_API_KEY")
            or os.getenv("AI_API_KEY")
        )
        self.model = model or os.getenv("AI_MODEL") or getattr(settings, "AI_MODEL", "gpt-4o-mini")
        self.base_url = (
            base_url
            or os.getenv("AI_BASE_URL")
            or getattr(settings, "AI_BASE_URL", "https://api.openai.com/v1")
        ).rstrip("/")
        self.timeout = timeout
        self.max_retries = max(1, max_retries)
        self.initial_backoff = initial_backoff
        self.sleep_func = sleep_func

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            raise LLMConfigError("OpenAI/Groq API key is not configured.")

        url = f"{self.base_url}/chat/completions"

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 2048,
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )

        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    resp_data = json.loads(response.read().decode("utf-8"))

                choices = resp_data.get("choices", [])
                if not choices:
                    raise LLMGenerationError("No choices returned from OpenAI.")
                content = choices[0].get("message", {}).get("content")
                if not content:
                    raise LLMGenerationError("Empty text response returned from OpenAI.")
                return content

            except urllib.error.HTTPError as e:
                code = e.code
                error_body = ""
                try:
                    error_body = e.read().decode("utf-8")
                except Exception:
                    pass

                if code in (401, 403):
                    logger.error("OpenAI authentication failed (HTTP %s).", code)
                    raise LLMAuthError(f"OpenAI authentication failed with status {code}.") from None
                elif code in (400, 404):
                    logger.error("OpenAI invalid request (HTTP %s).", code)
                    raise LLMInvalidRequestError(f"OpenAI API request invalid (HTTP {code}).") from None
                elif code == 429:
                    last_error = LLMRateLimitError(f"OpenAI rate limit exceeded (HTTP 429).")
                elif code == 503:
                    last_error = LLMUnavailableError(f"OpenAI service temporarily unavailable (HTTP 503).")
                elif code in self.TRANSIENT_STATUS_CODES:
                    last_error = LLMTransientError(f"OpenAI transient server error (HTTP {code}).")
                else:
                    logger.error("OpenAI request failed with HTTP %s.", code)
                    raise LLMGenerationError(f"OpenAI API request failed with status {code}.") from None

                if attempt < self.max_retries and code in self.TRANSIENT_STATUS_CODES:
                    backoff = self.initial_backoff * (2 ** (attempt - 1))
                    logger.warning(
                        "OpenAI request failed with HTTP %s; retrying (attempt %d/%d) in %.1fs...",
                        code,
                        attempt,
                        self.max_retries,
                        backoff,
                    )
                    self.sleep_func(backoff)
                else:
                    logger.error("OpenAI request failed after %d attempt(s) with HTTP %s.", attempt, code)
                    raise last_error from None

            except (KeyError, IndexError, json.JSONDecodeError) as e:
                logger.error("Failed to parse OpenAI response: %s", type(e).__name__)
                raise LLMGenerationError("Invalid response structure from OpenAI API.") from None
            except (LLMConfigError, LLMAuthError, LLMInvalidRequestError, LLMGenerationError):
                raise
            except Exception as e:
                logger.error("OpenAI connection error on attempt %d/%d: %s", attempt, self.max_retries, type(e).__name__)
                last_error = LLMGenerationError(f"Failed to communicate with OpenAI API: {type(e).__name__}")
                if attempt < self.max_retries:
                    backoff = self.initial_backoff * (2 ** (attempt - 1))
                    self.sleep_func(backoff)
                else:
                    raise last_error from None

        if last_error:
            raise last_error from None
        raise LLMGenerationError("OpenAI generation failed after retries.")


class UnconfiguredLLMService(BaseLLMService):
    """
    Fallback service when no LLM provider or API key is configured.
    """

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        raise LLMConfigError(
            "No AI LLM provider is configured. Please configure AI_API_KEY / GEMINI_API_KEY / OPENAI_API_KEY."
        )


def get_llm_service() -> BaseLLMService:
    """
    Factory function returning the configured LLM service instance.
    """
    provider = os.getenv("AI_PROVIDER") or getattr(settings, "AI_PROVIDER", None)

    # Auto-detect provider if not explicitly specified
    if not provider:
        if os.getenv("GEMINI_API_KEY"):
            provider = "gemini"
        elif os.getenv("OPENAI_API_KEY"):
            provider = "openai"
        elif os.getenv("GROQ_API_KEY"):
            provider = "groq"
        elif os.getenv("AI_API_KEY"):
            provider = "gemini"
        else:
            return UnconfiguredLLMService()

    provider = provider.lower().strip()

    if provider in ("gemini", "google"):
        return GeminiLLMService()
    elif provider in ("openai", "chatgpt"):
        return OpenAILLMService()
    elif provider == "groq":
        return OpenAILLMService(
            base_url=os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1"),
            model=os.getenv("AI_MODEL", "llama-3.3-70b-versatile"),
        )
    elif provider in ("generic_openai", "custom"):
        return OpenAILLMService()
    else:
        logger.warning("Unrecognized AI_PROVIDER '%s', defaulting to unconfigured.", provider)
        return UnconfiguredLLMService()
