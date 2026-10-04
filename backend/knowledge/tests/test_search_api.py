import tempfile
from unittest.mock import MagicMock, patch
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from knowledge.vectorstore import ChromaVectorStore


class KnowledgeSearchAPITestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="student_alpha",
            email="alpha@example.com",
            password="testpassword123",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="student_beta",
            email="beta@example.com",
            password="testpassword123",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.temp_dir = tempfile.TemporaryDirectory()
        self.mock_vectorstore = ChromaVectorStore(persist_dir=self.temp_dir.name)

        # Populate user1 vectors
        self.mock_vectorstore.add_chunks(
            user_id=self.user1.id,
            material_id=1,
            document_id=10,
            material_title="Alpha Neural Networks",
            material_type="pdf",
            chunks=[
                {
                    "chunk_index": 0,
                    "text": "Backpropagation computes loss gradients via the chain rule.",
                    "page_number": 5,
                }
            ],
            embeddings=[[0.1] * 384],
        )

        # Populate user2 vectors
        self.mock_vectorstore.add_chunks(
            user_id=self.user2.id,
            material_id=2,
            document_id=20,
            material_title="Beta Quantum Computing",
            material_type="pdf",
            chunks=[
                {
                    "chunk_index": 0,
                    "text": "Qubits exhibit quantum superposition and entanglement.",
                    "page_number": 12,
                }
            ],
            embeddings=[[0.9] * 384],
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_unauthenticated_search_returns_401(self):
        response = self.client.get("/api/knowledge/search", {"q": "backpropagation"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_empty_query_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get("/api/knowledge/search", {"q": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

        # Missing q parameter
        response_missing = self.client.get("/api/knowledge/search")
        self.assertEqual(response_missing.status_code, status.HTTP_400_BAD_REQUEST)

    def test_query_too_long_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        long_q = "a" * 1001
        response = self.client.get("/api/knowledge/search", {"q": long_q})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("knowledge.views.get_vectorstore")
    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_authenticated_search_with_bearer_token(self, mock_get_model, mock_get_vs):
        mock_get_vs.return_value = self.mock_vectorstore
        mock_model = MagicMock()
        mock_model.encode.return_value = [[0.1] * 384]
        mock_get_model.return_value = mock_model

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get("/api/knowledge/search", {"q": "backpropagation"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)

        result = response.data[0]
        self.assertEqual(result["sourceName"], "Alpha Neural Networks")
        self.assertEqual(result["sourceType"], "pdf")
        self.assertEqual(result["page"], 5)
        self.assertIn("Backpropagation computes", result["text"])
        self.assertGreater(result["relevance"], 0.8)

    @patch("knowledge.views.get_vectorstore")
    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_authenticated_search_with_token_keyword(self, mock_get_model, mock_get_vs):
        mock_get_vs.return_value = self.mock_vectorstore
        mock_model = MagicMock()
        mock_model.encode.return_value = [[0.1] * 384]
        mock_get_model.return_value = mock_model

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.get("/api/knowledge/search", {"q": "backpropagation"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["sourceName"], "Alpha Neural Networks")

    @patch("knowledge.views.get_vectorstore")
    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_user_isolation_between_users(self, mock_get_model, mock_get_vs):
        mock_get_vs.return_value = self.mock_vectorstore
        mock_model = MagicMock()
        mock_model.encode.return_value = [[0.1] * 384]
        mock_get_model.return_value = mock_model

        # User 2 searches for "backpropagation" (which only User 1 has)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2.key}")
        response = self.client.get("/api/knowledge/search", {"q": "backpropagation"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should NOT return User 1's results
        for item in response.data:
            self.assertNotEqual(item["sourceName"], "Alpha Neural Networks")
