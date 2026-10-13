from django.urls import path

from . import views


urlpatterns = [
    path("chat", views.tutor_chat, name="tutor-chat"),
    path("chat/", views.tutor_chat, name="tutor-chat-slash"),
    path("history", views.tutor_history, name="tutor-history"),
    path("history/", views.tutor_history, name="tutor-history-slash"),
]
