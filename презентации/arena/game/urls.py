from django.urls import path

from . import views

# Таблица маршрутов: какой адрес какую функцию вызывает
urlpatterns = [
    path("", views.index, name="index"),
    path("heroes/<int:pk>/", views.hero_detail, name="hero_detail"),
    path("play/", views.play, name="play"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("api/scores/", views.api_scores, name="api_scores"),
]
