from django.db import migrations

# Стартовые бойцы. Все герои придуманы для урока.
HEROES = [
    ("Искра", "⚡", "Стрелок", 55, 80, 90, "Быстрая героиня. Стреляет молниями и легко уходит от врагов."),
    ("Глыба", "🪨", "Защитник", 100, 50, 30, "Медленный, но очень прочный. Защищает команду своим телом."),
    ("Тень", "🥷", "Убийца", 50, 90, 70, "Появляется из кустов и быстро бьёт ближнего врага."),
    ("Бим", "🤖", "Универсал", 70, 55, 60, "Робот. Держит центр карты и помогает команде."),
    ("Колючка", "🌵", "Снайпер", 45, 85, 50, "Бросает иглы издалека. Лучше всего прячется в кустах."),
    ("Рыжик", "🦊", "Разведчик", 60, 65, 95, "Очень быстрый. Заходит в тыл и уходит раньше, чем враги ответят."),
]


def add_heroes(apps, schema_editor):
    Hero = apps.get_model("game", "Hero")
    for name, emoji, role, hp, damage, speed, text in HEROES:
        Hero.objects.create(name=name, emoji=emoji, role=role, hp=hp,
                            damage=damage, speed=speed, description=text)


def remove_heroes(apps, schema_editor):
    apps.get_model("game", "Hero").objects.filter(name__in=[h[0] for h in HEROES]).delete()


class Migration(migrations.Migration):
    dependencies = [("game", "0001_initial")]
    operations = [migrations.RunPython(add_heroes, remove_heroes)]
