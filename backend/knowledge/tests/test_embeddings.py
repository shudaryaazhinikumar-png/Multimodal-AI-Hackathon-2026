from unittest.mock import MagicMock, patch
from django.test import SimpleTestCase
import numpy as np

from knowledge.embeddings import EmbeddingService, get_embedding_service


class EmbeddingsTestCase(SimpleTestCase):
    def test_singleton_instance(self):
        service1 = get_embedding_service()
        service2 = get_embedding_service()
        self.assertIs(service1, service2)

    def test_embed_empty_texts(self):
        service = get_embedding_service()
        self.assertEqual(service.embed_texts([]), [])

    def test_embed_empty_query_raises(self):
        service = get_embedding_service()
        with self.assertRaises(ValueError):
            service.embed_query("")
        with self.assertRaises(ValueError):
            service.embed_query("   ")

    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_embed_texts_mocked(self, mock_get_model):
        mock_model = MagicMock()
        # Mock 2 embeddings of dimension 384
        fake_embeddings = np.array([[0.1] * 384, [0.2] * 384])
        mock_model.encode.return_value = fake_embeddings
        mock_get_model.return_value = mock_model

        service = EmbeddingService()
        results = service.embed_texts(["first text", "second text"])

        self.assertEqual(len(results), 2)
        self.assertEqual(len(results[0]), 384)
        mock_model.encode.assert_called_once()

    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_embed_query_mocked(self, mock_get_model):
        mock_model = MagicMock()
        fake_embedding = np.array([[0.5] * 384])
        mock_model.encode.return_value = fake_embedding
        mock_get_model.return_value = mock_model

        service = EmbeddingService()
        query_vec = service.embed_query("What is backpropagation?")

        self.assertEqual(len(query_vec), 384)
        self.assertEqual(query_vec[0], 0.5)
