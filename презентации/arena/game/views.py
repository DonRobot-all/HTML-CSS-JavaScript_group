import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods

from .models import Hero, Score

TOP_SIZE = 10          # сколько строк показываем в таблице рекордов
MAX_CRYSTALS = 200     # больше за одну игру собрать нельзя (простая защита от обмана)


def top_scores(limit=TOP_SIZE):
    """Лучшие результаты в виде списка словарей (удобно отдавать в JSON)."""
    return [
        {"name": s.player_name, "crystals": s.crystals}
        for s in Score.objects.all()[:limit]
    ]


# ---------- Страницы (возвращают HTML) ----------

def index(request):
    """Главная: все бойцы из базы данных и тройка лидеров."""
    return render(request, "game/index.html", {
        "heroes": Hero.objects.all(),
        "top": top_scores(3),
    })


def hero_detail(request, pk):
    """Страница одного бойца. Если id нет в базе, будет ошибка 404."""
    hero = get_object_or_404(Hero, pk=pk)
    return render(request, "game/hero_detail.html", {"hero": hero})


def play(request):
    """Страница с игрой. Игра написана на JavaScript, а результат уходит на сервер."""
    return render(request, "game/play.html", {"top": top_scores()})


def leaderboard(request):
    return render(request, "game/leaderboard.html", {"top": top_scores()})


# ---------- API (возвращает JSON для JavaScript) ----------

@require_http_methods(["GET", "POST"])
def api_scores(request):
    """GET — отдать таблицу рекордов. POST — сохранить новый результат."""
    if request.method == "GET":
        return JsonResponse({"scores": top_scores()})

    # POST: разбираем JSON, который прислал JavaScript через fetch
    try:
        data = json.loads(request.body)
        name = str(data["name"]).strip()
        crystals = int(data["crystals"])
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"ok": False, "error": "Неверные данные"}, status=400)

    if not (1 <= len(name) <= 20):
        return JsonResponse({"ok": False, "error": "Имя: от 1 до 20 символов"}, status=400)
    if not (0 <= crystals <= MAX_CRYSTALS):
        return JsonResponse({"ok": False, "error": "Странное число кристаллов"}, status=400)

    Score.objects.create(player_name=name, crystals=crystals)

    # Место игрока = сколько результатов строго лучше + 1
    place = Score.objects.filter(crystals__gt=crystals).count() + 1
    return JsonResponse({"ok": True, "place": place, "scores": top_scores()}, status=201)
