from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import TutorMessage


class TutorAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tutor_student",
            email="tutor@example.com",
            password="test-password",
        )
        self.token = Token.objects.create(user=self.user)
        self.other_user = User.objects.create_user(
            username="other_student",
            email="other@example.com",
            password="test-password",
        )
        self.other_token = Token.objects.create(user=self.other_user)
        self.chat_url = reverse("tutor-chat")
        self.history_url = reverse("tutor-history")

    def authenticate(self, token=None):
        token = token or self.token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def test_chat_requires_authentication(self):
        response = self.client.post(self.chat_url, {"content": "Explain derivatives"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_chat_rejects_empty_and_oversized_messages(self):
        self.authenticate()

        for content in ("   ", "x" * 1001):
            with self.subTest(content_length=len(content)):
                response = self.client.post(self.chat_url, {"content": content})
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(response.data["code"], "invalid_message")

    @patch("tutor.views.get_vectorstore")
    @patch("tutor.views.get_embedding_service")
    def test_chat_returns_retrieval_only_answer_and_real_source_metadata(
        self,
        mock_get_embedding_service,
        mock_get_vectorstore,
    ):
        mock_get_embedding_service.return_value.embed_query.return_value = [0.1, 0.2]
        mock_get_vectorstore.return_value.search.return_value = [
            {
                "id": "chunk-12",
                "text": "A derivative measures the instantaneous rate of change.",
                "sourceName": "Calculus Notes",
                "sourceType": "pdf",
                "page": 7,
                "relevance": 0.91,
                "materialId": 31,
                "documentId": 9,
                "chunkIndex": 2,
            }
        ]
        self.authenticate()

        response = self.client.post(
            self.chat_url,
            {"content": "What is a derivative?", "action": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "ai")
        self.assertTrue(response.data["id"].startswith("tutor-"))
        self.assertIn("Answer generation is not configured", response.data["content"])
        self.assertIn("instantaneous rate of change", response.data["content"])
        self.assertEqual(
            response.data["sources"],
            [
                {
                    "id": "chunk-12",
                    "title": "Calculus Notes",
                    "type": "pdf",
                    "snippet": "A derivative measures the instantaneous rate of change.",
                    "page": 7,
                    "relevance": 0.91,
                    "materialId": 31,
                    "documentId": 9,
                    "chunkIndex": 2,
                }
            ],
        )
        mock_get_vectorstore.return_value.search.assert_called_once_with(
            user_id=self.user.id,
            query_embedding=[0.1, 0.2],
            n_results=5,
        )
        self.assertEqual(TutorMessage.objects.filter(user=self.user).count(), 2)

    @patch("tutor.views.get_vectorstore")
    @patch("tutor.views.get_embedding_service")
    def test_chat_returns_controlled_no_material_error(
        self,
        mock_get_embedding_service,
        mock_get_vectorstore,
    ):
        mock_get_embedding_service.return_value.embed_query.return_value = [0.1]
        mock_get_vectorstore.return_value.search.return_value = []
        self.authenticate()

        response = self.client.post(self.chat_url, {"content": "Explain a topic"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["code"], "no_relevant_material")
        self.assertEqual(TutorMessage.objects.count(), 0)

    @patch("tutor.views.get_embedding_service")
    def test_retrieval_failure_does_not_expose_internal_error(self, mock_get_embedding_service):
        mock_get_embedding_service.return_value.embed_query.side_effect = RuntimeError(
            "private model path"
        )
        self.authenticate()

        response = self.client.post(self.chat_url, {"content": "Explain a topic"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["code"], "retrieval_unavailable")
        self.assertNotIn("private model path", str(response.data))

    def test_history_requires_authentication(self):
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_history_is_isolated_to_authenticated_user(self):
        own_message = TutorMessage.objects.create(
            user=self.user,
            role="student",
            content="My question",
        )
        other_message = TutorMessage.objects.create(
            user=self.other_user,
            role="student",
            content="Another student's private question",
        )
        self.authenticate()

        response = self.client.get(self.history_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], f"tutor-{own_message.pk}")
        self.assertEqual(response.data[0]["content"], "My question")
        self.assertNotIn(other_message.content, str(response.data))
