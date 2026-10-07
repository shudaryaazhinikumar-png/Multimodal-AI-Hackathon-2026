from django.urls import path

from . import views

urlpatterns = [
    path("search", views.knowledge_search, name="knowledge-search"),
    path("documents/<int:material_id>", views.document_detail, name="knowledge-document-detail"),
]
