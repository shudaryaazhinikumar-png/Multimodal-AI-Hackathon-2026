from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ExtractedSection:
    """
    Represents an atomic section (page, slide, or timestamp block) of a document.
    """

    section_type: str  # 'page', 'slide', 'general'
    number: Optional[int] = None  # 1-indexed page or slide number
    text: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExtractionResult:
    """
    Encapsulates all extracted sections and combined text from a learning material.
    """

    sections: List[ExtractedSection] = field(default_factory=list)
    full_text: str = ""
    material_type: str = "pdf"
    metadata: Dict[str, Any] = field(default_factory=dict)
