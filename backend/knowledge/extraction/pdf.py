import logging
from pathlib import Path
from typing import Union

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from .base import ExtractedSection, ExtractionResult

logger = logging.getLogger(__name__)


def extract_pdf(file_path: Union[str, Path]) -> ExtractionResult:
    """
    Extracts text and page-level metadata from a PDF file using PyMuPDF (fitz).
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found at: {path}")

    sections = []
    full_text_parts = []

    try:
        doc = fitz.open(str(path))
    except Exception as e:
        logger.error(f"Failed to open PDF file {path}: {e}")
        raise ValueError(f"Failed to read PDF file: {e}") from e

    try:
        page_count = len(doc)
        metadata = {
            "page_count": page_count,
            "title": doc.metadata.get("title") or path.stem,
            "author": doc.metadata.get("author") or "",
        }

        for page_index in range(page_count):
            page = doc.load_page(page_index)
            text = page.get_text("text") or ""
            page_num = page_index + 1

            sections.append(
                ExtractedSection(
                    section_type="page",
                    number=page_num,
                    text=text,
                    metadata={"page": page_num, "total_pages": page_count},
                )
            )
            if text.strip():
                full_text_parts.append(text.strip())

        return ExtractionResult(
            sections=sections,
            full_text="\n\n".join(full_text_parts),
            material_type="pdf",
            metadata=metadata,
        )
    finally:
        doc.close()
