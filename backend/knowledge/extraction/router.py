import logging
from pathlib import Path
from typing import Optional, Union

from .base import ExtractionResult
from .pdf import extract_pdf
from .powerpoint import extract_powerpoint

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {
    ".pdf": "pdf",
    ".pptx": "ppt",
    ".ppt": "ppt",
}


def extract_text_from_file(
    file_path: Union[str, Path],
    material_type: Optional[str] = None,
) -> ExtractionResult:
    """
    Extracts structured text from a file based on its file extension or material type.
    Raises ValueError for unsupported formats.
    """
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".pdf" or material_type == "pdf":
        return extract_pdf(path)

    if extension in {".pptx", ".ppt"} or material_type in {"ppt", "pptx"}:
        return extract_powerpoint(path)

    if extension in {".mp4", ".mov", ".avi", ".mkv", ".webm"} or material_type == "video":
        raise ValueError(
            "Video transcription is not supported in this phase. Supported file formats are PDF and PPTX."
        )

    raise ValueError(
        f"Unsupported file type '{extension or 'unknown'}'. Supported formats are PDF (.pdf) and PowerPoint (.pptx, .ppt)."
    )
