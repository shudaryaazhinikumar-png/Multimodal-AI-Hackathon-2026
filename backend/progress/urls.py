from django.urls import path

from . import views

urlpatterns = [
    path("analytics", views.progress_analytics, name="progress-analytics"),
    path("analytics/", views.progress_analytics, name="progress-analytics-slash"),
    path(
        "recommendations",
        views.progress_recommendations,
        name="progress-recommendations",
    ),
    path(
        "recommendations/",
        views.progress_recommendations,
        name="progress-recommendations-slash",
    ),
    path(
        "assessment/submit",
        views.submit_assessment_progress,
        name="assessment-submit",
    ),
    path(
        "assessment/submit/",
        views.submit_assessment_progress,
        name="assessment-submit-slash",
    ),
    path("history", views.progress_history, name="progress-history"),
    path("history/", views.progress_history, name="progress-history-slash"),
]
