from django.urls import path

from . import views


urlpatterns = [
    path("signup", views.signup, name="signup"),
    path("signup/", views.signup, name="signup-slash"),
    path("register", views.signup, name="register"),
    path("register/", views.signup, name="register-slash"),
    path("login", views.login, name="login"),
    path("login/", views.login, name="login-slash"),
    path("logout", views.logout, name="logout"),
    path("logout/", views.logout, name="logout-slash"),
    path("me", views.me, name="me"),
    path("me/", views.me, name="me-slash"),
    path("profile", views.profile, name="profile"),
    path("profile/", views.profile, name="profile-slash"),
]