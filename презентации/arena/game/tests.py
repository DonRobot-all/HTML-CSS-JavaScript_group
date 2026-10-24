import json

from django.test import TestCase
from django.urls import reverse

from .models import Hero, Score


class PageTests(TestCase):
    def test_стартовые_бойцы_созданы_миграцией(self):
        self.assertEqual(Hero.objects.count(), 6)

    def test_страницы_открываются(self):
        hero = Hero.objects.first()
        for url in [reverse("index"), reverse("play"), reverse("leaderboard"),
                    reverse("hero_detail", args=[hero.pk])]:
            self.assertEqual(self.client.get(url).status_code, 200, url)

    def test_несуществующий_боец_даёт_404(self):
        self.assertEqual(self.client.get(reverse("hero_detail", args=[9999])).status_code, 404)


class ApiTests(TestCase):
    def post(self, payload):
        return self.client.post(reverse("api_scores"), json.dumps(payload),
                                content_type="application/json")

    def test_результат_сохраняется_и_место_считается(self):
        self.post({"name": "Макс", "crystals": 10})
        r = self.post({"name": "Аня", "crystals": 15})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["place"], 1)
        self.assertEqual(Score.objects.count(), 2)

    def test_таблица_отсортирована(self):
        self.post({"name": "A", "crystals": 3})
        self.post({"name": "B", "crystals": 9})
        names = [s["name"] for s in self.client.get(reverse("api_scores")).json()["scores"]]
        self.assertEqual(names, ["B", "A"])

    def test_плохие_данные_отклоняются(self):
        for bad in [{"name": "", "crystals": 5}, {"name": "x" * 21, "crystals": 5},
                    {"name": "Макс", "crystals": -1}, {"name": "Макс", "crystals": 9999},
                    {"name": "Макс", "crystals": "много"}, {"crystals": 5}]:
            self.assertEqual(self.post(bad).status_code, 400, bad)
        self.assertEqual(Score.objects.count(), 0)

    def test_html_в_имени_экранируется(self):
        self.post({"name": "<b>хак</b>", "crystals": 1})
        html = self.client.get(reverse("leaderboard")).content.decode()
        self.assertNotIn("<b>хак</b>", html)
