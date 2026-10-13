from datetime import timedelta
import logging

from django.db import models
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.authentication import BearerOrTokenAuthentication
from materials.models import Material
from .models import LearningProgress
from .serializers import (
    AssessmentSubmitSerializer,
    LearningProgressSerializer,
)

logger = logging.getLogger(__name__)


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def progress_analytics(request):
    """
    GET /api/progress/analytics
    Returns aggregated learning progress analytics for the authenticated user.
    """
    records = LearningProgress.objects.filter(user=request.user).order_by("created_at")

    if not records.exists():
        return Response(
            {
                "knowledgeScore": 0,
                "retention": 0,
                "consistency": 0,
                "weakAreas": 0,
                "knowledgeGrowth": [],
                "accuracyOverTime": [],
                "studyTime": [],
                "retentionData": [],
                "topicMastery": [],
                "weeklyActivity": [],
                "aiSummary": "No assessment data recorded yet. Complete quizzes to track your learning journey.",
                "strongestArea": "None yet",
            },
            status=status.HTTP_200_OK,
        )

    # Calculate overall scores
    scores = [r.score for r in records]
    accuracies = [r.accuracy if r.accuracy > 0 else (r.score / 100.0) for r in records]
    avg_score = sum(scores) / len(scores)
    avg_acc = (sum(accuracies) / len(accuracies)) * 100.0

    # Aggregate topic mastery
    topic_data = {}
    for r in records:
        t = r.topic or "General"
        if t not in topic_data:
            topic_data[t] = []
        topic_data[t].append(r.score)

    topic_mastery = []
    weak_areas = 0
    strongest_area = "General"
    best_mastery = -1.0

    for topic, topic_scores in topic_data.items():
        mastery = sum(topic_scores) / len(topic_scores)
        topic_mastery.append({
            "topic": topic,
            "mastery": round(mastery, 1),
        })
        if mastery < 70.0:
            weak_areas += 1
        if mastery > best_mastery:
            best_mastery = mastery
            strongest_area = topic

    # Chronological growth
    knowledge_growth = []
    accuracy_over_time = []
    retention_data = []
    study_time = []

    for r in records:
        date_str = r.created_at.strftime("%b %d")
        knowledge_growth.append({
            "date": date_str,
            "score": round(r.score, 1),
        })
        accuracy_over_time.append({
            "date": date_str,
            "accuracy": round((r.accuracy if r.accuracy > 0 else (r.score / 100.0)) * 100.0, 1),
        })
        retention_data.append({
            "date": date_str,
            "retention": round(r.mastery_level * 100.0 if r.mastery_level > 0 else r.score, 1),
        })
        # Estimate ~5 mins per quiz/activity
        study_time.append({
            "date": date_str,
            "minutes": max(5, r.total_questions * 2),
        })

    # Weekly activity
    now = timezone.now()
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_activity = []
    for i in range(7):
        target_day = now - timedelta(days=6 - i)
        day_records = [
            r for r in records
            if r.created_at.date() == target_day.date()
        ]
        weekly_activity.append({
            "day": days[target_day.weekday()],
            "hours": round(sum(max(5, r.total_questions * 2) for r in day_records) / 60.0, 1),
        })

    # Consistency based on number of active days in last 30 days
    active_days = len(set(r.created_at.date() for r in records if (now.date() - r.created_at.date()).days <= 30))
    consistency = min(100, int((active_days / 30.0) * 100.0))

    summary_text = (
        f"You have completed {records.count()} learning activities. "
        f"Your strongest subject is {strongest_area} with {round(best_mastery, 1)}% mastery. "
        + (f"Focus on {weak_areas} topic(s) needing review." if weak_areas > 0 else "All topics are at solid mastery.")
    )

    return Response(
        {
            "knowledgeScore": round(avg_score, 1),
            "retention": round(avg_acc, 1),
            "consistency": consistency,
            "weakAreas": weak_areas,
            "knowledgeGrowth": knowledge_growth,
            "accuracyOverTime": accuracy_over_time,
            "studyTime": study_time,
            "retentionData": retention_data,
            "topicMastery": topic_mastery,
            "weeklyActivity": weekly_activity,
            "aiSummary": summary_text,
            "strongestArea": strongest_area,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def progress_recommendations(request):
    """
    GET /api/progress/recommendations
    Returns personalized revision recommendations based on the user's progress.
    """
    records = LearningProgress.objects.filter(user=request.user)
    recommendations = []

    # Check weak topics
    topic_data = {}
    for r in records:
        t = r.topic or "General"
        if t not in topic_data:
            topic_data[t] = []
        topic_data[t].append(r.score)

    rec_id = 1
    for topic, scores in topic_data.items():
        avg = sum(scores) / len(scores)
        if avg < 70.0:
            recommendations.append({
                "id": f"rec-{rec_id}",
                "topic": topic,
                "reason": f"Average score is {round(avg, 1)}% in recent activities.",
                "estimatedTime": "15 mins",
                "priority": "high",
                "category": "weak-topics",
            })
            rec_id += 1

    # Check uploaded materials that might not have been tested
    untested_materials = Material.objects.filter(user=request.user, status="processed")
    for mat in untested_materials[:3]:
        has_record = records.filter(material=mat).exists()
        if not has_record:
            recommendations.append({
                "id": f"rec-{rec_id}",
                "topic": mat.title,
                "reason": "New study material ready for review.",
                "estimatedTime": "20 mins",
                "priority": "medium",
                "category": "due-today",
            })
            rec_id += 1

    if not recommendations:
        recommendations.append({
            "id": "rec-default",
            "topic": "Core Fundamentals",
            "reason": "Complete practice questions to maintain retention.",
            "estimatedTime": "10 mins",
            "priority": "medium",
            "category": "recently-learned",
        })

    return Response(recommendations, status=status.HTTP_200_OK)


@api_view(["POST"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_assessment_progress(request):
    """
    POST /api/progress/assessment/submit
    Records a completed assessment or quiz session into the database.
    """
    serializer = AssessmentSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    topic = serializer.validated_data.get("topic", "General")
    score = serializer.validated_data.get("score", 0.0)
    total_q = serializer.validated_data.get("total_questions", 0)
    correct_q = serializer.validated_data.get("correct_answers", 0)
    accuracy = serializer.validated_data.get("accuracy")
    material_id = serializer.validated_data.get("material_id")
    extra_data = serializer.validated_data.get("data", {})

    material = None
    if material_id:
        material = Material.objects.filter(id=material_id, user=request.user).first()

    if accuracy is None:
        if total_q > 0:
            accuracy = correct_q / float(total_q)
        else:
            accuracy = score / 100.0

    mastery_level = min(1.0, max(0.0, accuracy))

    progress = LearningProgress.objects.create(
        user=request.user,
        material=material,
        activity_type="assessment",
        topic=topic,
        score=score,
        total_questions=total_q,
        correct_answers=correct_q,
        accuracy=accuracy,
        mastery_level=mastery_level,
        data=extra_data,
    )

    return Response(
        LearningProgressSerializer(progress).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@authentication_classes([BearerOrTokenAuthentication])
@permission_classes([IsAuthenticated])
def progress_history(request):
    """
    GET /api/progress/history
    Returns chronological progress history for the authenticated user.
    """
    records = LearningProgress.objects.filter(user=request.user).order_by("-created_at")
    serializer = LearningProgressSerializer(records, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
