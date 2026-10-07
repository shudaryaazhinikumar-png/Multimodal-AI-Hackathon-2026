import io
import json
import urllib.error
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from ai.llm import (
    GeminiLLMService,
    LLMAuthError,
    LLMConfigError,
    LLMGenerationError,
    LLMInvalidRequestError,
    LLMRateLimitError,
    LLMTransientError,
    LLMUnavailableError,
    OpenAILLMService,
    UnconfiguredLLMService,
    get_llm_service,
)
from ai.prompts import TUTOR_SYSTEM_PROMPT, build_tutor_prompt
from ai.tutor_service import format_context_from_sources, to_chat_sources
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

    def test_chat_supports_token_header(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.post(self.chat_url, {"content": "   "})
        # Authenticated, fails at validation
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_chat_rejects_empty_and_oversized_messages(self):
        self.authenticate()

        for content in ("   ", "x" * 1001):
            with self.subTest(content_length=len(content)):
                response = self.client.post(self.chat_url, {"content": content})
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(response.data["code"], "invalid_message")

    @patch("ai.tutor_service.get_llm_service")
    @patch("ai.tutor_service.get_vectorstore")
    @patch("ai.tutor_service.get_embedding_service")
    def test_chat_successful_llm_generation_and_citation_integrity(
        self,
        mock_get_embedding_service,
        mock_get_vectorstore,
        mock_get_llm_service,
    ):
        mock_get_embedding_service.return_value.embed_query.return_value = [0.1, 0.2]
        mock_get_vectorstore.return_value.search.return_value = [
            {
                "id": "chunk-12",
                "text": "A derivative measures the instantaneous rate of change of a function with respect to its variable.",
                "sourceName": "Calculus Notes",
                "sourceType": "pdf",
                "page": 7,
                "relevance": 0.91,
                "materialId": 31,
                "documentId": 9,
                "chunkIndex": 2,
            }
        ]
        mock_llm = MagicMock()
        mock_llm.generate.return_value = (
            "A derivative represents how fast a function's value changes at any given point, "
            "as described on page 7 of your Calculus Notes."
        )
        mock_get_llm_service.return_value = mock_llm

        self.authenticate()

        response = self.client.post(
            self.chat_url,
            {"content": "What is a derivative?", "action": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "ai")
        self.assertTrue(response.data["id"].startswith("tutor-"))
        self.assertEqual(
            response.data["content"],
            "A derivative represents how fast a function's value changes at any given point, "
            "as described on page 7 of your Calculus Notes.",
        )
        # Citations integrity: must match actual retrieval metadata exactly
        self.assertEqual(
            response.data["sources"],
            [
                {
                    "id": "chunk-12",
                    "title": "Calculus Notes",
                    "type": "pdf",
                    "snippet": "A derivative measures the instantaneous rate of change of a function with respect to its variable.",
                    "page": 7,
                    "relevance": 0.91,
                    "materialId": 31,
                    "documentId": 9,
                    "chunkIndex": 2,
                }
            ],
        )
        # Verify vector store call
        mock_get_vectorstore.return_value.search.assert_called_once_with(
            user_id=self.user.id,
            query_embedding=[0.1, 0.2],
            n_results=5,
        )
        # Verify LLM call
        mock_llm.generate.assert_called_once()
        prompt_arg = mock_llm.generate.call_args[1]["prompt"]
        system_prompt_arg = mock_llm.generate.call_args[1]["system_prompt"]
        self.assertIn("What is a derivative?", prompt_arg)
        self.assertIn("Calculus Notes", prompt_arg)
        self.assertEqual(system_prompt_arg, TUTOR_SYSTEM_PROMPT)

        # Verify chat history persisted (student + ai message)
        messages = TutorMessage.objects.filter(user=self.user).order_by("created_at")
        self.assertEqual(messages.count(), 2)
        self.assertEqual(messages[0].role, "student")
        self.assertEqual(messages[0].content, "What is a derivative?")
        self.assertEqual(messages[1].role, "ai")
        self.assertEqual(messages[1].content, response.data["content"])

    @patch("ai.tutor_service.get_vectorstore")
    @patch("ai.tutor_service.get_embedding_service")
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

    @patch("ai.tutor_service.get_embedding_service")
    def test_retrieval_failure_does_not_expose_internal_error(self, mock_get_embedding_service):
        mock_get_embedding_service.return_value.embed_query.side_effect = RuntimeError(
            "private model path"
        )
        self.authenticate()

        response = self.client.post(self.chat_url, {"content": "Explain a topic"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["code"], "retrieval_unavailable")
        self.assertNotIn("private model path", str(response.data))
        self.assertEqual(TutorMessage.objects.count(), 0)

    @patch("ai.tutor_service.get_llm_service")
    @patch("ai.tutor_service.get_vectorstore")
    @patch("ai.tutor_service.get_embedding_service")
    def test_llm_generation_failure_returns_controlled_503(
        self,
        mock_get_embedding_service,
        mock_get_vectorstore,
        mock_get_llm_service,
    ):
        mock_get_embedding_service.return_value.embed_query.return_value = [0.1, 0.2]
        mock_get_vectorstore.return_value.search.return_value = [
            {
                "id": "chunk-1",
                "text": "Linear algebra notes.",
                "sourceName": "Matrices",
                "sourceType": "pdf",
            }
        ]
        mock_llm = MagicMock()
        mock_llm.generate.side_effect = LLMGenerationError("Upstream connection timeout: secret_api_key_123")
        mock_get_llm_service.return_value = mock_llm

        self.authenticate()

        response = self.client.post(self.chat_url, {"content": "What is an eigenvalue?"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["code"], "generation_unavailable")
        self.assertNotIn("secret_api_key_123", str(response.data))
        self.assertEqual(TutorMessage.objects.count(), 0)

    @patch("ai.tutor_service.get_llm_service")
    @patch("ai.tutor_service.get_vectorstore")
    @patch("ai.tutor_service.get_embedding_service")
    def test_unconfigured_llm_returns_controlled_503(
        self,
        mock_get_embedding_service,
        mock_get_vectorstore,
        mock_get_llm_service,
    ):
        mock_get_embedding_service.return_value.embed_query.return_value = [0.1, 0.2]
        mock_get_vectorstore.return_value.search.return_value = [
            {
                "id": "chunk-1",
                "text": "Algorithms notes.",
                "sourceName": "Sorting",
                "sourceType": "pdf",
            }
        ]
        mock_get_llm_service.return_value = UnconfiguredLLMService()

        self.authenticate()

        response = self.client.post(self.chat_url, {"content": "Explain Quicksort"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["code"], "generation_unavailable")
        self.assertEqual(TutorMessage.objects.count(), 0)

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


class AIModuleUnitTests(APITestCase):
    """
    Unit tests for ai.prompts, ai.tutor_service, and ai.llm providers.
    """

    def test_build_tutor_prompt(self):
        prompt = build_tutor_prompt(
            question="What is backprop?",
            context="Backpropagation calculates gradients via chain rule.",
        )
        self.assertIn("Backpropagation calculates gradients", prompt)
        self.assertIn("What is backprop?", prompt)

    def test_format_context_from_sources(self):
        sources = [
            {
                "title": "Deep Learning Book",
                "page": 42,
                "snippet": "Neural networks learn via gradient descent.",
            },
            {
                "title": "Lecture Slides",
                "slide": 5,
                "snippet": "Activation functions introduce non-linearity.",
            },
        ]
        context = format_context_from_sources(sources)
        self.assertIn("Source [1]: Deep Learning Book — Page 42", context)
        self.assertIn("Source [2]: Lecture Slides — Slide 5", context)
        self.assertIn("Neural networks learn via gradient descent.", context)

    def test_to_chat_sources_mapping(self):
        raw_results = [
            {
                "id": "c-101",
                "text": "Sample text",
                "sourceName": "My Note",
                "sourceType": "pdf",
                "page": 1,
                "relevance": 0.88,
                "materialId": 10,
                "documentId": 5,
                "chunkIndex": 0,
            }
        ]
        sources = to_chat_sources(raw_results)
        self.assertEqual(len(sources), 1)
        self.assertEqual(sources[0]["id"], "c-101")
        self.assertEqual(sources[0]["title"], "My Note")
        self.assertEqual(sources[0]["snippet"], "Sample text")
        self.assertEqual(sources[0]["page"], 1)

    @patch("urllib.request.urlopen")
    def test_gemini_service_generate_success(self, mock_urlopen):
        mock_response = MagicMock()
        response_body = {
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Gemini generated explanation."}]
                    }
                }
            ]
        }
        mock_response.read.return_value = json.dumps(response_body).encode("utf-8")
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        service = GeminiLLMService(api_key="test-gemini-key", model="gemini-3.8-flash")
        result = service.generate("Explain entropy", system_prompt="Be concise")
        self.assertEqual(result, "Gemini generated explanation.")

    def test_gemini_service_default_model(self):
        with patch.dict("os.environ", {}, clear=True):
            service = GeminiLLMService(api_key="test-key")
            self.assertEqual(service.model, "gemini-3.8-flash")

    def test_gemini_service_respects_env_model(self):
        with patch.dict("os.environ", {"AI_MODEL": "gemini-3.8-flash"}, clear=True):
            service = GeminiLLMService(api_key="test-key")
            self.assertEqual(service.model, "gemini-3.8-flash")

    @patch("urllib.request.urlopen")
    def test_gemini_service_generate_http_error(self, mock_urlopen):
        error_file = io.BytesIO(b'{"error": {"message": "Quota exceeded"}}')
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://generativelanguage.googleapis.com",
            code=429,
            msg="Too Many Requests",
            hdrs={},
            fp=error_file,
        )

        mock_sleep = MagicMock()
        service = GeminiLLMService(api_key="test-gemini-key", max_retries=2, sleep_func=mock_sleep)
        with self.assertRaises(LLMRateLimitError) as ctx:
            service.generate("Explain entropy")
        self.assertIn("HTTP 429", str(ctx.exception))
        self.assertEqual(mock_sleep.call_count, 1)

    @patch("urllib.request.urlopen")
    def test_gemini_service_retry_503_success(self, mock_urlopen):
        # 1st call raises 503, 2nd call succeeds
        err_file = io.BytesIO(b'{"error": {"message": "Service unavailable"}}')
        http_err = urllib.error.HTTPError(
            url="https://generativelanguage.googleapis.com",
            code=503,
            msg="Service Unavailable",
            hdrs={},
            fp=err_file,
        )
        mock_success = MagicMock()
        resp_data = {"candidates": [{"content": {"parts": [{"text": "Recovered after 503."}]}}]}
        mock_success.read.return_value = json.dumps(resp_data).encode("utf-8")
        mock_success.__enter__.return_value = mock_success

        mock_urlopen.side_effect = [http_err, mock_success]

        mock_sleep = MagicMock()
        service = GeminiLLMService(api_key="test-gemini-key", max_retries=3, sleep_func=mock_sleep)
        result = service.generate("Explain retry")
        self.assertEqual(result, "Recovered after 503.")
        self.assertEqual(mock_urlopen.call_count, 2)
        self.assertEqual(mock_sleep.call_count, 1)

    @patch("urllib.request.urlopen")
    def test_gemini_service_retry_429_success(self, mock_urlopen):
        # 1st call raises 429, 2nd call succeeds
        err_file = io.BytesIO(b'{"error": {"message": "Rate limit"}}')
        http_err = urllib.error.HTTPError(
            url="https://generativelanguage.googleapis.com",
            code=429,
            msg="Rate limit",
            hdrs={},
            fp=err_file,
        )
        mock_success = MagicMock()
        resp_data = {"candidates": [{"content": {"parts": [{"text": "Recovered after 429."}]}}]}
        mock_success.read.return_value = json.dumps(resp_data).encode("utf-8")
        mock_success.__enter__.return_value = mock_success

        mock_urlopen.side_effect = [http_err, mock_success]

        mock_sleep = MagicMock()
        service = GeminiLLMService(api_key="test-gemini-key", max_retries=3, sleep_func=mock_sleep)
        result = service.generate("Explain rate limit")
        self.assertEqual(result, "Recovered after 429.")
        self.assertEqual(mock_urlopen.call_count, 2)
        self.assertEqual(mock_sleep.call_count, 1)

    @patch("urllib.request.urlopen")
    def test_gemini_service_400_fails_immediately_without_retry(self, mock_urlopen):
        err_file = io.BytesIO(b'{"error": {"message": "Bad request"}}')
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://generativelanguage.googleapis.com",
            code=400,
            msg="Bad Request",
            hdrs={},
            fp=err_file,
        )

        from ai.llm import LLMInvalidRequestError
        mock_sleep = MagicMock()
        service = GeminiLLMService(api_key="test-gemini-key", max_retries=3, sleep_func=mock_sleep)
        with self.assertRaises(LLMInvalidRequestError):
            service.generate("Invalid prompt")
        self.assertEqual(mock_urlopen.call_count, 1)
        self.assertEqual(mock_sleep.call_count, 0)

    @patch("urllib.request.urlopen")
    def test_gemini_service_401_fails_immediately_without_retry(self, mock_urlopen):
        err_file = io.BytesIO(b'{"error": {"message": "Invalid API key"}}')
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://generativelanguage.googleapis.com",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=err_file,
        )

        from ai.llm import LLMAuthError
        mock_sleep = MagicMock()
        service = GeminiLLMService(api_key="test-gemini-key", max_retries=3, sleep_func=mock_sleep)
        with self.assertRaises(LLMAuthError):
            service.generate("Unauthorized prompt")
        self.assertEqual(mock_urlopen.call_count, 1)
        self.assertEqual(mock_sleep.call_count, 0)

    @patch("urllib.request.urlopen")
    def test_gemini_service_repeated_503_eventually_raises(self, mock_urlopen):
        err_file = io.BytesIO(b'{"error": {"message": "Overloaded"}}')
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://generativelanguage.googleapis.com",
            code=503,
            msg="Service Unavailable",
            hdrs={},
            fp=err_file,
        )

        from ai.llm import LLMUnavailableError
        mock_sleep = MagicMock()
        service = GeminiLLMService(api_key="test-gemini-key", max_retries=3, sleep_func=mock_sleep)
        with self.assertRaises(LLMUnavailableError):
            service.generate("Overloaded prompt")
        self.assertEqual(mock_urlopen.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)

    @patch("urllib.request.urlopen")
    def test_gemini_service_empty_candidates_raises(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({"candidates": []}).encode("utf-8")
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        service = GeminiLLMService(api_key="test-gemini-key")
        with self.assertRaises(LLMGenerationError) as ctx:
            service.generate("Hello")
        self.assertIn("No candidates", str(ctx.exception))

    @patch("urllib.request.urlopen")
    def test_openai_service_generate_success(self, mock_urlopen):
        mock_response = MagicMock()
        response_body = {
            "choices": [
                {
                    "message": {
                        "content": "OpenAI generated explanation."
                    }
                }
            ]
        }
        mock_response.read.return_value = json.dumps(response_body).encode("utf-8")
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        service = OpenAILLMService(api_key="test-openai-key", model="gpt-4o-mini")
        result = service.generate("Explain gravity", system_prompt="Physics tutor")
        self.assertEqual(result, "OpenAI generated explanation.")

    @patch("urllib.request.urlopen")
    def test_openai_service_generate_http_error(self, mock_urlopen):
        error_file = io.BytesIO(b'{"error": "Unauthorized"}')
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://api.openai.com/v1/chat/completions",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=error_file,
        )

        from ai.llm import LLMAuthError
        service = OpenAILLMService(api_key="invalid-key")
        with self.assertRaises(LLMAuthError) as ctx:
            service.generate("Explain gravity")
        self.assertIn("status 401", str(ctx.exception))

    def test_unconfigured_service_raises_config_error(self):
        service = UnconfiguredLLMService()
        with self.assertRaises(LLMConfigError) as ctx:
            service.generate("Hello")
        self.assertIn("No AI LLM provider is configured", str(ctx.exception))

    def test_get_llm_service_factory_unconfigured_when_no_env(self):
        with patch.dict("os.environ", {}, clear=True):
            service = get_llm_service()
            self.assertIsInstance(service, UnconfiguredLLMService)

    def test_get_llm_service_factory_gemini(self):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "dummy-key"}, clear=True):
            service = get_llm_service()
            self.assertIsInstance(service, GeminiLLMService)

    def test_get_llm_service_factory_openai(self):
        with patch.dict("os.environ", {"OPENAI_API_KEY": "dummy-key"}, clear=True):
            service = get_llm_service()
            self.assertIsInstance(service, OpenAILLMService)

    def test_get_llm_service_factory_groq(self):
        with patch.dict("os.environ", {"GROQ_API_KEY": "dummy-key"}, clear=True):
            service = get_llm_service()
            self.assertIsInstance(service, OpenAILLMService)

