from django.test import SimpleTestCase

from knowledge.cleaning import clean_section_text, normalize_text


class TextCleaningTestCase(SimpleTestCase):
    def test_normalize_whitespace_and_newlines(self):
        raw = "Hello   world!\r\n\r\n\r\n\r\nThis is   a test.\n  Line 2.  "
        cleaned = normalize_text(raw)
        expected = "Hello world!\n\nThis is a test.\nLine 2."
        self.assertEqual(cleaned, expected)

    def test_unicode_normalization(self):
        # Non-breaking spaces and unicode ligatures
        raw = "Machine\u00a0Learning\u200b and AI"
        cleaned = normalize_text(raw)
        self.assertEqual(cleaned, "Machine Learning and AI")

    def test_clean_section_text_empty_and_trivial(self):
        self.assertEqual(clean_section_text(""), "")
        self.assertEqual(clean_section_text("   \n\n  "), "")
        self.assertEqual(clean_section_text("-"), "")

    def test_clean_section_text_valid_content(self):
        raw = "  Deep Learning\n\nNeural networks learn hierarchically.  "
        cleaned = clean_section_text(raw)
        self.assertEqual(cleaned, "Deep Learning\n\nNeural networks learn hierarchically.")
