from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from materials.models import Material
from .models import LearningProgress


class ProgressAPITestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="test-password-1",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="student2",
            email="student2@example.com",
            password="test-password-2",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.analytics_url = reverse("progress-analytics")
        self.recommendations_url = reverse("progress-recommendations")
        self.submit_url = reverse("assessment-submit")
        self.history_url = reverse("progress-history")

    def test_analytics_requires_authentication(self):
        response = self.client.get(self.analytics_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_analytics_empty_state_returns_zeroes_without_mock_invention(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get(self.analytics_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["knowledgeScore"], 0)
        self.assertEqual(data["retention"], 0)
        self.assertEqual(data["topicMastery"], [])
        self.assertIn("No assessment data recorded yet", data["aiSummary"])

    def test_submit_assessment_persists_in_database(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        payload = {
            "topic": "Neural Networks",
            "score": 85.0,
            "total_questions": 10,
            "correct_answers": 8,
            "accuracy": 0.8,
            "data": {"quiz_type": "adaptive"},
        }
        response = self.client.post(self.submit_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LearningProgress.objects.filter(user=self.user1).count(), 1)
        record = LearningProgress.objects.get(user=self.user1)
        self.assertEqual(record.topic, "Neural Networks")
        self.assertEqual(record.score, 85.0)
        self.assertEqual(record.correct_answers, 8)

    def test_user_isolation_prevents_viewing_other_user_progress(self):
        # Create progress for user 1
        LearningProgress.objects.create(
            user=self.user1,
            topic="Neural Networks",
            score=90.0,
            total_questions=10,
            correct_answers=9,
            accuracy=0.9,
            mastery_level=0.9,
        )

        # User 2 checks history
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2.key}")
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 0)

        # User 2 checks analytics
        analytics_resp = self.client.get(self.analytics_url)
        self.assertEqual(analytics_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(analytics_resp.json()["knowledgeScore"], 0)

    def test_analytics_computes_real_mastery_and_growth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        LearningProgress.objects.create(
            user=self.user1,
            topic="Optimization",
            score=80.0,
            total_questions=5,
            correct_answers=4,
            accuracy=0.8,
            mastery_level=0.8,
        )
        LearningProgress.objects.create(
            user=self.user1,
            topic="Optimization",
            score=60.0,
            total_questions=5,
            correct_answers=3,
            accuracy=0.6,
            mastery_level=0.6,
        )

        response = self.client.get(self.analytics_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["knowledgeScore"], 70.0)
        self.assertEqual(len(data["topicMastery"]), 1)
        self.assertEqual(data["topicMastery"][0]["topic"], "Optimization")
        self.assertEqual(data["topicMastery"][0]["mastery"], 70.0)
