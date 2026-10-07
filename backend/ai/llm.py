"""
Configurable LLM provider abstraction for the AI Study Companion.
Supports Google Gemini, OpenAI, Groq, and OpenAI-compatible providers.
"""

import json
import logging
import os
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Base exception for LLM service operations."""
    pass


class LLMConfigError(LLMError):
    """Raised when the LLM service is misconfigured or missing credentials."""
    pass


class LLMGenerationError(LLMError):
    """Raised when text generation from the LLM provider fails."""
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
    Google Gemini REST API implementation.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 30,
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")
        self.model = model or os.getenv("AI_MODEL") or getattr(settings, "AI_MODEL", "gemini-2.5-flash")
        self.timeout = timeout

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

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            error_body = ""
            try:
                error_body = e.read().decode("utf-8")
            except Exception:
                pass
            logger.error("Gemini HTTP Error %s: %s", e.code, error_body)
            raise LLMGenerationError(f"Gemini API request failed with status {e.code}.") from e
        except Exception as e:
            logger.error("Gemini connection error: %s", e)
            raise LLMGenerationError("Failed to communicate with Gemini API.") from e

        try:
            candidates = resp_data.get("candidates", [])
            if not candidates:
                raise LLMGenerationError("No candidates returned from Gemini.")
            text = candidates[0]["content"]["parts"][0]["text"]
            return text
        except (KeyError, IndexError) as e:
            logger.error("Failed to parse Gemini response structure: %s", resp_data)
            raise LLMGenerationError("Invalid response structure from Gemini API.") from e


class OpenAILLMService(BaseLLMService):
    """
    OpenAI-compatible REST API implementation (works with OpenAI, Groq, OpenRouter, etc.).
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: int = 30,
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

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            error_body = ""
            try:
                error_body = e.read().decode("utf-8")
            except Exception:
                pass
            logger.error("OpenAI HTTP Error %s: %s", e.code, error_body)
            raise LLMGenerationError(f"OpenAI API request failed with status {e.code}.") from e
        except Exception as e:
            logger.error("OpenAI connection error: %s", e)
            raise LLMGenerationError("Failed to communicate with OpenAI API.") from e

        try:
            choices = resp_data.get("choices", [])
            if not choices:
                raise LLMGenerationError("No choices returned from OpenAI.")
            text = choices[0]["message"]["content"]
            return text
        except (KeyError, IndexError) as e:
            logger.error("Failed to parse OpenAI response structure: %s", resp_data)
            raise LLMGenerationError("Invalid response structure from OpenAI API.") from e


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

