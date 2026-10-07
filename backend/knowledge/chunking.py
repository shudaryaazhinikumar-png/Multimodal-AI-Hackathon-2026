import logging
import re
from typing import Any, Dict, List, Optional

from django.conf import settings

from .cleaning import clean_section_text
from .extraction.base import ExtractedSection, ExtractionResult

logger = logging.getLogger(__name__)

DEFAULT_CHUNK_SIZE = getattr(settings, "KNOWLEDGE_CHUNK_SIZE", 1000)
DEFAULT_CHUNK_OVERLAP = getattr(settings, "KNOWLEDGE_CHUNK_OVERLAP", 150)


def split_text_into_chunks(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> List[str]:
    """
    Splits text into chunks of approximately `chunk_size` characters with `chunk_overlap`.
    Attempts natural splits at paragraphs, sentences, or word boundaries.
    """
    text = text.strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size

        if end >= text_len:
            chunk = text[start:].strip()
            if chunk:
                chunks.append(chunk)
            break

        # Look for natural split points within the overlap window
        # 1. Paragraph boundary (\n\n)
        # 2. Sentence boundary (. , ! , ? followed by space or newline)
        # 3. Newline (\n)
        # 4. Word boundary (space)
        split_pos = -1
        search_window = text[start : end + 50]  # give small buffer
        min_split_point = max(start + (chunk_size // 2), start)

        # Try paragraph split
        para_matches = [m.start() for m in re.finditer(r"\n\n+", search_window)]
        for pos in reversed(para_matches):
            abs_pos = start + pos
            if min_split_point <= abs_pos <= end:
                split_pos = abs_pos
                break

        # Try sentence split if no paragraph split found
        if split_pos == -1:
            sent_matches = [m.end() for m in re.finditer(r"[.!?]\s+", search_window)]
            for pos in reversed(sent_matches):
                abs_pos = start + pos
                if min_split_point <= abs_pos <= end:
                    split_pos = abs_pos
                    break

        # Try line split if no sentence split found
        if split_pos == -1:
            line_matches = [m.start() for m in re.finditer(r"\n", search_window)]
            for pos in reversed(line_matches):
                abs_pos = start + pos
                if min_split_point <= abs_pos <= end:
                    split_pos = abs_pos
                    break

        # Try whitespace split
        if split_pos == -1:
            space_matches = [m.start() for m in re.finditer(r"\s+", search_window)]
            for pos in reversed(space_matches):
                abs_pos = start + pos
                if min_split_point <= abs_pos <= end:
                    split_pos = abs_pos
                    break

        # Fallback to exact chunk_size if no natural boundary found
        if split_pos == -1 or split_pos <= start:
            split_pos = end

        chunk = text[start:split_pos].strip()
        if chunk:
            chunks.append(chunk)

        # Advance start index accounting for overlap
        next_start = split_pos - chunk_overlap
        if next_start <= start:
            next_start = split_pos

        start = next_start

    return chunks


def chunk_extraction_result(
    extraction: ExtractionResult,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
    extra_metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Converts an ExtractionResult into an ordered list of chunk dictionaries with metadata.
    Preserves page and slide numbers per chunk.
    """
    chunks_data = []
    chunk_index = 0
    extra_meta = extra_metadata or {}

    for section in extraction.sections:
        cleaned_text = clean_section_text(section.text)
        if not cleaned_text:
            continue

        raw_chunks = split_text_into_chunks(
            cleaned_text,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        for chunk_text in raw_chunks:
            if not chunk_text.strip():
                continue

            page_num = section.number if section.section_type == "page" else None
            slide_num = section.number if section.section_type == "slide" else None

            meta = {
                **extra_meta,
                "section_type": section.section_type,
                "chunk_index": chunk_index,
            }
            if page_num is not None:
                meta["page"] = page_num
            if slide_num is not None:
                meta["slide"] = slide_num

            chunks_data.append(
                {
                    "chunk_index": chunk_index,
                    "text": chunk_text,
                    "page_number": page_num,
                    "slide_number": slide_num,
                    "metadata": meta,
                }
            )
            chunk_index += 1

    return chunks_data
