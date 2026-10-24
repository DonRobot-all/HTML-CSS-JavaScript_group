# Арена бойцов: сайт на Python + Django + HTML + CSS + JavaScript

Учебный проект. Герои придуманы, сайт не связан с Supercell.

## Запуск

```bash
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
python manage.py migrate       # создаёт базу данных и 6 стартовых бойцов
python manage.py runserver
```

Открой http://127.0.0.1:8000/

Админка (добавлять бойцов и удалять результаты):

```bash
python manage.py createsuperuser
```

Потом http://127.0.0.1:8000/admin/

Проверка кода: `python manage.py test`

## Кто за что отвечает

| Технология | Что делает | Где лежит |
|---|---|---|
| Python | Логика сайта: проверка данных, подсчёт места игрока | `game/views.py` |
| Django ORM | Таблицы в базе: бойцы и результаты | `game/models.py`, `game/migrations/` |
| Django URL | Какой адрес какую функцию вызывает | `game/urls.py` |
| Django-шаблоны | HTML-страницы с данными из базы (`{% for %}`, `{{ }}`) | `game/templates/game/` |
| CSS | Внешний вид | `game/static/game/css/style.css` |
| JavaScript | Поиск бойцов, игра на canvas, отправка рекорда, обновление таблицы | `game/static/game/js/` |

## Как данные ходят по сайту

1. Браузер просит `/` → Django берёт бойцов из базы → шаблон `index.html` превращает их в HTML.
2. На странице `/play/` работает игра (JavaScript). Когда игра закончилась, `fetch` отправляет `POST /api/scores/` с именем и числом кристаллов.
3. Python в `api_scores()` проверяет данные, сохраняет их в базу и возвращает JSON с таблицей.
4. JavaScript получает JSON и перерисовывает таблицу рекордов без перезагрузки страницы.

## Идеи для развития

1. Добавь бойцу поле «редкость» (`models.py` → `makemigrations` → `migrate`) и покажи его на карточке.
2. Сделай фильтр бойцов по роли кнопками (JavaScript).
3. Добавь режимы игры: поле `mode` в `Score` и отдельные таблицы рекордов.
4. Добавь регистрацию игроков через `django.contrib.auth`.

## Важно

`SECRET_KEY` и `DEBUG = True` в `config/settings.py` подходят только для учёбы. Для публикации в интернете их нужно заменить.
