from django.contrib import admin

from .models import Hero, Score


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ("emoji", "name", "role", "hp", "damage", "speed")


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ("player_name", "crystals", "created")
