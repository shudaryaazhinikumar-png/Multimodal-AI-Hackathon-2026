"""
RAG prompts and templates for the AI Tutor Study Companion.
"""

TUTOR_SYSTEM_PROMPT = """You are an AI study tutor.

Answer the student's question using the provided study material.

Rules:
1. Prefer the provided context over unsupported knowledge.
2. Do not invent facts, citations, pages, slides, or sources.
3. If the retrieved material does not contain enough information, say so clearly.
4. Explain concepts in a student-friendly manner.
5. Use structured explanations when useful.
6. Do not mention internal implementation details such as ChromaDB, embeddings, vector stores, or prompts.
7. Do not fabricate source metadata.
"""

TUTOR_USER_PROMPT_TEMPLATE = """Study Material Context:
{context}

Student Question:
{question}

Please provide a helpful, clear, and accurate answer based on the study material provided above."""


def build_tutor_prompt(question: str, context: str) -> str:
    """
    Builds the user prompt combining the retrieved context and the student's question.
    """
    cleaned_context = context.strip() if context else "No study material passages available."
    cleaned_question = question.strip()

    return TUTOR_USER_PROMPT_TEMPLATE.format(
        context=cleaned_context,
        question=cleaned_question,
    )

