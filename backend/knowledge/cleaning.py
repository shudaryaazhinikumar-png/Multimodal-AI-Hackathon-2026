import re
import unicodedata


def normalize_text(text: str) -> str:
    """
    Normalizes unicode, standardizes newlines and spaces, and preserves paragraph breaks.
    """
    if not text:
        return ""

    # Normalize unicode (NFC standard form, converts non-breaking spaces, smart quotes, etc.)
    text = unicodedata.normalize("NFKC", text)

    # Strip zero-width characters
    text = re.sub(r"[\u200b\u200c\u200d\ufeff]", "", text)

    # Standardize line breaks (\r\n and \r to \n)
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Clean horizontal whitespace per line (tabs and multiple spaces -> single space)
    lines = []
    for line in text.split("\n"):
        cleaned_line = re.sub(r"[^\S\n]+", " ", line).strip()
        lines.append(cleaned_line)

    text = "\n".join(lines)

    # Collapse 3 or more consecutive newlines to 2 (preserving paragraph structure)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def clean_section_text(text: str) -> str:
    """
    Cleans text from a single page/slide section. Returns empty string if no meaningful text.
    """
    cleaned = normalize_text(text)
    # Filter out trivial boilerplate or artifact lines (e.g., lone symbols)
    if len(cleaned.strip()) < 2:
        return ""
    return cleaned
