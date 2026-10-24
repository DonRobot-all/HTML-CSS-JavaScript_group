from django.core.validators import MaxValueValidator
from django.db import models


class Hero(models.Model):
    """Боец. Каждая строка таблицы в базе данных — один герой."""

    name = models.CharField("Имя", max_length=40)
    emoji = models.CharField("Значок", max_length=8)
    role = models.CharField("Роль", max_length=40)
    hp = models.PositiveSmallIntegerField("Здоровье", validators=[MaxValueValidator(100)])
    damage = models.PositiveSmallIntegerField("Урон", validators=[MaxValueValidator(100)])
    speed = models.PositiveSmallIntegerField("Скорость", validators=[MaxValueValidator(100)])
    description = models.TextField("Описание")

    class Meta:
        ordering = ["id"]
        verbose_name = "боец"
        verbose_name_plural = "бойцы"

    def __str__(self):
        return f"{self.emoji} {self.name}"


class Score(models.Model):
    """Результат игрока в мини-игре."""

    player_name = models.CharField("Игрок", max_length=20)
    crystals = models.PositiveSmallIntegerField("Кристаллов")
    created = models.DateTimeField("Когда", auto_now_add=True)

    class Meta:
        ordering = ["-crystals", "created"]   # лучшие сверху
        verbose_name = "результат"
        verbose_name_plural = "результаты"

    def __str__(self):
        return f"{self.player_name}: {self.crystals}"
