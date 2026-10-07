from django.test import SimpleTestCase

from knowledge.chunking import chunk_extraction_result, split_text_into_chunks
from knowledge.extraction.base import ExtractedSection, ExtractionResult


class ChunkingTestCase(SimpleTestCase):
    def test_split_short_text(self):
        text = "This is a short sentence."
        chunks = split_text_into_chunks(text, chunk_size=100, chunk_overlap=20)
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0], text)

    def test_split_long_text_with_overlap(self):
        paragraphs = [
            "Paragraph one introduces fundamental supervised learning concepts and notation.",
            "Paragraph two explains the cost function and gradient descent optimization algorithm.",
            "Paragraph three covers backpropagation through computational graphs and chain rule.",
        ]
        text = "\n\n".join(paragraphs)
        chunks = split_text_into_chunks(text, chunk_size=100, chunk_overlap=30)
        self.assertGreater(len(chunks), 1)
        for chunk in chunks:
            self.assertTrue(len(chunk) > 0)
            self.assertLessEqual(len(chunk), 160)

    def test_chunk_extraction_result_preserves_metadata(self):
        extraction = ExtractionResult(
            sections=[
                ExtractedSection(section_type="page", number=1, text="Page one introductory content."),
                ExtractedSection(section_type="page", number=2, text="Page two advanced topics in AI."),
            ],
            full_text="Page one introductory content.\n\nPage two advanced topics in AI.",
            material_type="pdf",
        )

        chunks = chunk_extraction_result(
            extraction,
            chunk_size=100,
            chunk_overlap=20,
            extra_metadata={"user_id": 1, "material_id": 5},
        )

        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0]["chunk_index"], 0)
        self.assertEqual(chunks[0]["page_number"], 1)
        self.assertEqual(chunks[0]["metadata"]["user_id"], 1)
        self.assertEqual(chunks[0]["metadata"]["material_id"], 5)
        self.assertEqual(chunks[0]["metadata"]["page"], 1)

        self.assertEqual(chunks[1]["chunk_index"], 1)
        self.assertEqual(chunks[1]["page_number"], 2)
        self.assertEqual(chunks[1]["metadata"]["page"], 2)

    def test_chunk_extraction_result_empty_sections(self):
        extraction = ExtractionResult(
            sections=[
                ExtractedSection(section_type="page", number=1, text="   "),
                ExtractedSection(section_type="page", number=2, text=""),
            ],
            full_text="",
            material_type="pdf",
        )
        chunks = chunk_extraction_result(extraction)
        self.assertEqual(len(chunks), 0)
