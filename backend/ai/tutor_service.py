"""
Tutor service layer integrating query embedding, ChromaDB vector retrieval,
RAG context construction, and LLM text generation.
"""

import logging
from typing import Any, Dict, List, Optional

from knowledge.embeddings import get_embedding_service
from knowledge.vectorstore import get_vectorstore
from .llm import BaseLLMService, LLMError, get_llm_service
from .prompts import TUTOR_SYSTEM_PROMPT, build_tutor_prompt

logger = logging.getLogger(__name__)


class TutorServiceError(Exception):
    """Base exception for Tutor service errors."""
    pass


class TutorNoMaterialError(TutorServiceError):
    """Raised when no relevant study material exists for the user's query."""
    pass


class TutorRetrievalError(TutorServiceError):
    """Raised when query embedding or vectorstore search encounters an error."""
    pass


class TutorGenerationError(TutorServiceError):
    """Raised when the LLM generation service fails."""
    pass


def to_chat_sources(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Converts ChromaDB search results into citation objects with validated fields.
    The backend owns citation metadata so the LLM cannot fabricate sources.
    """
    sources = []
    for result in results:
        source_type = result.get("sourceType", "other")
        if source_type not in {"pdf", "ppt", "video", "other"}:
            source_type = "other"

        source = {
            "id": str(result["id"]),
            "title": result.get("sourceName") or result.get("title") or "Study material",
            "type": source_type,
            "snippet": result["text"],
        }
        for field in ("page", "slide", "timestamp", "relevance", "materialId", "documentId", "chunkIndex"):
            value = result.get(field)
            if value is not None:
                source[field] = value
        sources.append(source)
    return sources


def format_context_from_sources(sources: List[Dict[str, Any]]) -> str:
    """
    Constructs formatted text context from the retrieved sources for the LLM prompt.
    """
    if not sources:
        return ""

    context_blocks = []
    for idx, source in enumerate(sources, start=1):
        location = ""
        if source.get("page") is not None:
            location = f" — Page {source['page']}"
        elif source.get("slide") is not None:
            location = f" — Slide {source['slide']}"

        title = source.get("title") or "Study Material"
        snippet = source.get("snippet") or ""
        context_blocks.append(f"Source [{idx}]: {title}{location}\nContent:\n{snippet.strip()}")

    return "\n\n".join(context_blocks)


def generate_tutor_response(
    *,
    user_id: int,
    question: str,
    llm_service: Optional[BaseLLMService] = None,
) -> Dict[str, Any]:
    """
    Orchestrates the full RAG pipeline for an AI Tutor question:
    1. Embeds question and queries isolated user collection in ChromaDB.
    2. Builds verified citations from actual retrieved chunks.
    3. Builds RAG prompt with context excerpts and student query.
    4. Calls LLM service to generate answer.
    5. Returns dict with 'answer' and 'sources'.
    """
    normalized_question = question.strip() if question else ""
    if not normalized_question:
        raise ValueError("Question cannot be empty.")

    # 1. Vector Retrieval
    try:
        query_embedding = get_embedding_service().embed_query(normalized_question)
        results = get_vectorstore().search(
            user_id=user_id,
            query_embedding=query_embedding,
            n_results=5,
        )
    except Exception as e:
        logger.exception("Tutor retrieval failed for user %s: %s", user_id, e)
        raise TutorRetrievalError("Study material retrieval failed.") from e

    if not results:
        raise TutorNoMaterialError("No relevant study material was found.")

    sources = to_chat_sources(results)
    if not sources:
        raise TutorNoMaterialError("No relevant study material was found.")

    # 2. Context Builder
    context = format_context_from_sources(sources)
    prompt = build_tutor_prompt(normalized_question, context)

    # 3. LLM Generation
    service = llm_service or get_llm_service()
    try:
        answer = service.generate(prompt=prompt, system_prompt=TUTOR_SYSTEM_PROMPT)
    except LLMError as e:
        logger.exception("LLM generation error for user %s: %s", user_id, e)
        raise TutorGenerationError("Failed to generate tutor answer.") from e
    except Exception as e:
        logger.exception("Unexpected LLM error for user %s: %s", user_id, e)
        raise TutorGenerationError("Failed to generate tutor answer.") from e

    if not answer or not answer.strip():
        raise TutorGenerationError("LLM returned empty answer.")

    return {
        "answer": answer.strip(),
        "sources": sources,
    }
