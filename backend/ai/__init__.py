"""
AI module for LLM generation and Tutor service.
"""

from .llm import (
    BaseLLMService,
    FallbackLLMService,
    GeminiLLMService,
    LLMAuthError,
    LLMConfigError,
    LLMError,
    LLMGenerationError,
    LLMInvalidRequestError,
    LLMRateLimitError,
    LLMTransientError,
    LLMUnavailableError,
    OpenAILLMService,
    get_llm_service,
)
from .prompts import TUTOR_SYSTEM_PROMPT, build_tutor_prompt
from .tutor_service import (
    TutorGenerationError,
    TutorNoMaterialError,
    TutorRetrievalError,
    TutorServiceError,
    format_context_from_sources,
    generate_tutor_response,
    to_chat_sources,
)

__all__ = [
    "BaseLLMService",
    "FallbackLLMService",
    "GeminiLLMService",
    "OpenAILLMService",
    "LLMError",
    "LLMConfigError",
    "LLMAuthError",
    "LLMGenerationError",
    "LLMTransientError",
    "LLMRateLimitError",
    "LLMUnavailableError",
    "LLMInvalidRequestError",
    "get_llm_service",
    "TUTOR_SYSTEM_PROMPT",
    "build_tutor_prompt",
    "TutorServiceError",
    "TutorNoMaterialError",
    "TutorRetrievalError",
    "TutorGenerationError",
    "generate_tutor_response",
    "to_chat_sources",
    "format_context_from_sources",
]
