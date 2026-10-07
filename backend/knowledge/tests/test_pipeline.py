import tempfile
from unittest.mock import MagicMock, patch
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from pptx import Presentation

from knowledge.models import KnowledgeChunk, KnowledgeDocument
from knowledge.pipeline import process_material
from knowledge.vectorstore import ChromaVectorStore, get_vectorstore
from materials.models import Material


class PipelineTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="testpassword123",
        )
        self.temp_dir = tempfile.TemporaryDirectory()
        self.mock_vectorstore = ChromaVectorStore(persist_dir=self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def _create_sample_pdf(self) -> bytes:
        doc = fitz.open()
        p1 = doc.new_page()
        p1.insert_text((50, 72), "Gradient Descent Optimization.\nIt calculates the loss gradient.")
        p2 = doc.new_page()
        p2.insert_text((50, 72), "Learning Rate.\nThe step size in optimization.")
        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes

    @patch("knowledge.pipeline.get_vectorstore")
    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_process_pdf_material_success(self, mock_get_model, mock_get_vs):
        mock_get_vs.return_value = self.mock_vectorstore
        mock_model = MagicMock()
        mock_model.encode.return_value = [[0.1] * 384, [0.2] * 384]
        mock_get_model.return_value = mock_model

        pdf_bytes = self._create_sample_pdf()
        uploaded = SimpleUploadedFile("calculus.pdf", pdf_bytes, content_type="application/pdf")

        material = Material.objects.create(
            user=self.user,
            title="Calculus Notes",
            file=uploaded,
            material_type="pdf",
            status="uploaded",
        )

        doc = process_material(material)

        # Check statuses
        material.refresh_from_db()
        self.assertEqual(material.status, "processed")
        self.assertEqual(doc.status, "processed")
        self.assertEqual(doc.chunk_count, 2)
        self.assertIn("Gradient Descent", doc.extracted_text)

        # Check DB chunks
        chunks = KnowledgeChunk.objects.filter(document=doc).order_by("chunk_index")
        self.assertEqual(chunks.count(), 2)
        self.assertEqual(chunks[0].page_number, 1)
        self.assertEqual(chunks[1].page_number, 2)

        # Check ChromaDB
        results = self.mock_vectorstore.search(
            user_id=self.user.id,
            query_embedding=[0.1] * 384,
        )
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["sourceName"], "Calculus Notes")

    @patch("knowledge.pipeline.get_vectorstore")
    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_reprocess_material(self, mock_get_model, mock_get_vs):
        mock_get_vs.return_value = self.mock_vectorstore
        mock_model = MagicMock()
        mock_model.encode.side_effect = lambda texts, **kw: [[0.1] * 384 for _ in texts]
        mock_get_model.return_value = mock_model

        pdf_bytes = self._create_sample_pdf()
        uploaded = SimpleUploadedFile("calculus.pdf", pdf_bytes, content_type="application/pdf")

        material = Material.objects.create(
            user=self.user,
            title="Calculus Notes",
            file=uploaded,
            material_type="pdf",
            status="uploaded",
        )

        # First run
        process_material(material)
        self.assertEqual(KnowledgeChunk.objects.filter(document__material=material).count(), 2)

        # Re-run / reprocess
        doc_reprocessed = process_material(material)
        self.assertEqual(doc_reprocessed.status, "processed")
        self.assertEqual(KnowledgeChunk.objects.filter(document__material=material).count(), 2)

    @patch("knowledge.pipeline.get_vectorstore")
    def test_process_unsupported_file_fails(self, mock_get_vs):
        mock_get_vs.return_value = self.mock_vectorstore

        uploaded = SimpleUploadedFile("video.mp4", b"fake video", content_type="video/mp4")
        material = Material.objects.create(
            user=self.user,
            title="Lecture Video",
            file=uploaded,
            material_type="video",
            status="uploaded",
        )

        with self.assertRaises(ValueError):
            process_material(material)

        material.refresh_from_db()
        self.assertEqual(material.status, "failed")
        doc = KnowledgeDocument.objects.get(material=material)
        self.assertEqual(doc.status, "failed")
        self.assertIn("Video transcription is not supported", doc.error_message)
