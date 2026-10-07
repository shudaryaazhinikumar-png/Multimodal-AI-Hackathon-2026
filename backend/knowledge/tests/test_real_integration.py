import tempfile
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from knowledge.embeddings import get_embedding_service
from knowledge.models import KnowledgeDocument
from knowledge.pipeline import process_material
from knowledge.vectorstore import ChromaVectorStore
from materials.models import Material


class RealEndToEndIntegrationTestCase(TestCase):
    """
    Real end-to-end test using actual SentenceTransformers model and ChromaDB.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="real_student",
            email="real@example.com",
            password="testpassword123",
        )
        self.temp_dir = tempfile.TemporaryDirectory()
        self.vectorstore = ChromaVectorStore(persist_dir=self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_real_embedding_and_search_similarity(self):
        # 1. Create a real PDF with Machine Learning content
        doc = fitz.open()
        p1 = doc.new_page()
        p1.insert_text(
            (50, 72),
            "Convolutional Neural Networks (CNNs) are widely used for image recognition and computer vision tasks. "
            "They use convolution layers to extract spatial features from input images.",
        )
        p2 = doc.new_page()
        p2.insert_text(
            (50, 72),
            "Recurrent Neural Networks (RNNs) and Transformers are designed for sequential data processing like natural language processing. "
            "Self-attention mechanisms allow transformers to model long-range dependencies effectively.",
        )
        pdf_bytes = doc.tobytes()
        doc.close()

        uploaded = SimpleUploadedFile("deep_learning.pdf", pdf_bytes, content_type="application/pdf")
        material = Material.objects.create(
            user=self.user,
            title="Deep Learning Architecture Guide",
            file=uploaded,
            material_type="pdf",
            status="uploaded",
        )

        # 2. Ingest through real pipeline (using real sentence transformer)
        # Point vectorstore to test temp dir
        with self.settings(CHROMA_PERSIST_DIRECTORY=self.temp_dir.name):
            kdoc = process_material(material)

        self.assertEqual(kdoc.status, "processed")
        self.assertEqual(material.status, "processed")
        self.assertEqual(kdoc.chunk_count, 2)

        # 3. Perform semantic query for image recognition
        embed_service = get_embedding_service()
        query_vec = embed_service.embed_query("How do computers process images and visual features?")
        results = self.vectorstore.search(
            user_id=self.user.id,
            query_embedding=query_vec,
            n_results=2,
        )

        self.assertGreater(len(results), 0)
        top_result = results[0]
        # The top result should be the CNN chunk (Page 1)
        self.assertEqual(top_result["page"], 1)
        self.assertIn("Convolutional Neural Networks", top_result["text"])
        self.assertGreater(top_result["relevance"], 0.4)
