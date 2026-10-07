import logging
from pathlib import Path
from typing import Union

from pptx import Presentation

from .base import ExtractedSection, ExtractionResult

logger = logging.getLogger(__name__)


def extract_powerpoint(file_path: Union[str, Path]) -> ExtractionResult:
    """
    Extracts text and slide-level metadata from a PPT/PPTX file using python-pptx.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PowerPoint file not found at: {path}")

    if path.suffix.lower() == ".ppt":
        # Legacy binary .ppt format is not directly supported by python-pptx (which supports OOXML .pptx).
        # Provide a helpful error message to the user.
        try:
            prs = Presentation(str(path))
        except Exception as e:
            raise ValueError(
                f"Legacy binary .ppt format cannot be parsed directly. Please save/convert the presentation as .pptx format: {e}"
            ) from e
    else:
        try:
            prs = Presentation(str(path))
        except Exception as e:
            logger.error(f"Failed to open PowerPoint file {path}: {e}")
            raise ValueError(f"Failed to read PowerPoint file: {e}") from e

    sections = []
    full_text_parts = []
    total_slides = len(prs.slides)

    for slide_index, slide in enumerate(prs.slides):
        slide_num = slide_index + 1
        slide_text_lines = []

        # Extract text from shapes
        for shape in slide.shapes:
            if shape.has_text_frame:
                for paragraph in shape.text_frame.paragraphs:
                    line = paragraph.text.strip()
                    if line:
                        slide_text_lines.append(line)

            if shape.has_table:
                for row in shape.table.rows:
                    row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_cells:
                        slide_text_lines.append(" | ".join(row_cells))

        # Extract notes if present
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes_text = slide.notes_slide.notes_text_frame.text.strip()
            if notes_text:
                slide_text_lines.append(f"Notes: {notes_text}")

        slide_text = "\n".join(slide_text_lines)

        sections.append(
            ExtractedSection(
                section_type="slide",
                number=slide_num,
                text=slide_text,
                metadata={"slide": slide_num, "total_slides": total_slides},
            )
        )
        if slide_text.strip():
            full_text_parts.append(slide_text.strip())

    return ExtractionResult(
        sections=sections,
        full_text="\n\n".join(full_text_parts),
        material_type="ppt",
        metadata={
            "slide_count": total_slides,
            "title": path.stem,
        },
    )
