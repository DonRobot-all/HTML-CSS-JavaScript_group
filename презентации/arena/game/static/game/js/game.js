// Игра «Охота за кристаллами» на canvas.
// Нужен файл scores.js: из него берём renderScores().
// Управление: стрелки или WASD. На телефоне: води пальцем по полю.

// ============ 1. НАСТРОЙКИ И ЭЛЕМЕНТЫ ============
const W = 800, H = 500;          // размеры игрового поля
const GAME_TIME = 45;            // секунд на игру
const START_LIVES = 3;

const root   = document.getElementById("game-root");
const apiUrl = root.dataset.api;       // адрес API: его передал Django
const csrf   = root.dataset.csrf;      // защитный токен Django для POST-запроса

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const overlay   = document.getElementById("overlay");
const ovTitle   = document.getElementById("ovTitle");
const ovText    = document.getElementById("ovText");
const scoreForm = document.getElementById("scoreForm");
const nameInput = document.getElementById("playerName");
const sendMsg   = document.getElementById("sendMsg");
const startBtn  = document.getElementById("startBtn");
const scoresEl  = document.getElementById("scores");
const hudScore  = document.getElementById("hudScore");
const hudLives  = document.getElementById("hudLives");
const hudTime   = document.getElementById("hudTime");

// ============ 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
function rand(min, max) { return Math.random() * (max - min) + min; }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function circle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ============ 3. ИГРОВЫЕ ОБЪЕКТЫ ============
class Player {
  constructor() { this.r = 16; this.speed = 260; this.reset(); }
  reset() { this.x = W / 2; this.y = H / 2; this.dirX = 1; this.invincible = 0; }

  update(dt) {
    let dx = 0, dy = 0;
    if (keys.left)  dx -= 1;
    if (keys.right) dx += 1;
    if (keys.up)    dy -= 1;
    if (keys.down)  dy += 1;

    if (dx !== 0 || dy !== 0) {
      pointerTarget = null;                       // клавиатура главнее пальца
    } else if (pointerTarget) {
      const vx = pointerTarget.x - this.x;
      const vy = pointerTarget.y - this.y;
      const len = Math.hypot(vx, vy);
      if (len > 6) { dx = vx / len; dy = vy / len; }
    }

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len; dy /= len;                       // по диагонали не быстрее
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      if (dx !== 0) this.dirX = dx > 0 ? 1 : -1;
    }

    this.x = Math.max(this.r, Math.min(W - this.r, this.x));
    this.y = Math.max(this.r, Math.min(H - this.r, this.y));
    if (this.invincible > 0) this.invincible -= dt;
  }

  draw() {
    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) return;   // мигание
    circle(this.x, this.y, this.r, "#3df5c8");
    circle(this.x - 5, this.y - 4, 5, "#fff");
    circle(this.x + 5, this.y - 4, 5, "#fff");
    circle(this.x - 5 + this.dirX * 2, this.y - 4, 2.5, "#0d0b26");
    circle(this.x + 5 + this.dirX * 2, this.y - 4, 2.5, "#0d0b26");
  }
}

class Crystal {
  constructor() {
    this.r = 11;
    this.x = rand(40, W - 40);
    this.y = rand(40, H - 40);
    this.phase = rand(0, 6);
  }
  draw(time) {
    const s = this.r * (1 + Math.sin(time * 4 + this.phase) * 0.15);
    ctx.fillStyle = "#ff4fa0";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - s * 1.3);
    ctx.lineTo(this.x + s, this.y);
    ctx.lineTo(this.x, this.y + s * 1.3);
    ctx.lineTo(this.x - s, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffd6ea";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Enemy {
  constructor() {
    this.r = 18;
    do {                                          // появляемся подальше от игрока
      this.x = rand(this.r, W - this.r);
      this.y = rand(this.r, H - this.r);
    } while (distance(this, player) < 200);
    const angle = rand(0, Math.PI * 2);
    const speed = rand(90, 150);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < this.r || this.x > W - this.r) this.vx *= -1;    // отскок от стен
    if (this.y < this.r || this.y > H - this.r) this.vy *= -1;
  }
  draw() {
    for (let i = 0; i < 8; i++) {                 // шипы
      const a = i * Math.PI / 4;
      circle(this.x + Math.cos(a) * this.r, this.y + Math.sin(a) * this.r, 6, "#ff5c5c");
    }
    circle(this.x, this.y, this.r, "#ff5c5c");
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x - 9, this.y - 5, 7, 7);
    ctx.fillRect(this.x + 2, this.y - 5, 7, 7);
    ctx.fillStyle = "#0d0b26";
    ctx.fillRect(this.x - 7, this.y - 3, 3, 3);
    ctx.fillRect(this.x + 4, this.y - 3, 3, 3);
  }
}

// ============ 4. СОСТОЯНИЕ ИГРЫ ============
let state = "start";             // "start", "play" или "over"
let score = 0, lives = START_LIVES, timeLeft = GAME_TIME;
let lastFrame = 0, elapsed = 0;
let sent = false;                // результат этой игры уже отправлен?

const player = new Player();
let crystals = [];
let enemies = [];

const keys = { left: false, right: false, up: false, down: false };
let pointerTarget = null;

// ============ 5. УПРАВЛЕНИЕ ============
const keyMap = {
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down"
};

window.addEventListener("keydown", function (e) {
  if (document.activeElement === nameInput) return;      // печатаем имя, а не играем
  if (keyMap[e.code]) { keys[keyMap[e.code]] = true; e.preventDefault(); }
});
window.addEventListener("keyup", function (e) {
  if (keyMap[e.code]) keys[keyMap[e.code]] = false;
});

function setTarget(e) {
  const rect = canvas.getBoundingClientRect();
  pointerTarget = {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height)
  };
}
canvas.addEventListener("pointerdown", setTarget);
canvas.addEventListener("pointermove", function (e) {
  if (e.buttons > 0 || e.pointerType === "touch") setTarget(e);
});

// ============ 6. ХОД ИГРЫ ============
function startGame() {
  score = 0; lives = START_LIVES; timeLeft = GAME_TIME; elapsed = 0; sent = false;
  player.reset();
  pointerTarget = null;
  crystals = [];
  enemies = [];
  for (let i = 0; i < 3; i++) enemies.push(new Enemy());
  state = "play";
  overlay.classList.add("hidden");
  lastFrame = performance.now();
}

function endGame(timeIsUp) {
  state = "over";
  ovTitle.textContent = timeIsUp ? "Время вышло!" : "Игра окончена";
  ovText.textContent = "Собрано кристаллов: " + score + ". Отправь результат в таблицу рекордов.";
  sendMsg.textContent = "";
  scoreForm.hidden = false;                       // показываем форму с именем
  try { nameInput.value = localStorage.getItem("playerName") || ""; } catch (e) {}
  startBtn.textContent = "Сыграть ещё раз";
  overlay.classList.remove("hidden");
}

function update(dt) {
  elapsed += dt;
  timeLeft -= dt;
  if (timeLeft <= 0) { timeLeft = 0; endGame(true); return; }

  player.update(dt);

  while (crystals.length < 3) crystals.push(new Crystal());

  const wanted = Math.min(8, 3 + Math.floor(elapsed / 10));   // каждые 10 секунд новый враг
  while (enemies.length < wanted) enemies.push(new Enemy());
  enemies.forEach(function (en) { en.update(dt); });

  crystals = crystals.filter(function (c) {
    if (distance(player, c) < player.r + c.r) { score++; return false; }
    return true;
  });

  if (player.invincible <= 0) {
    for (const en of enemies) {
      if (distance(player, en) < player.r + en.r - 4) {
        lives--;
        player.invincible = 1.5;
        if (lives <= 0) { lives = 0; endGame(false); return; }
        break;
      }
    }
  }
}

// ============ 7. РИСОВАНИЕ ============
function drawGrid() {
  ctx.strokeStyle = "rgba(120, 110, 220, 0.18)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

function draw(time) {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  crystals.forEach(function (c) { c.draw(time); });
  enemies.forEach(function (en) { en.draw(); });
  player.draw();
}

function updateHud() {
  hudScore.textContent = score;
  hudLives.textContent = lives;
  hudTime.textContent = Math.ceil(timeLeft);
}

// ============ 8. ИГРОВОЙ ЦИКЛ ============
function loop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  if (state === "play") update(dt);
  draw(now / 1000);
  updateHud();
  requestAnimationFrame(loop);
}

// ============ 9. СВЯЗЬ С СЕРВЕРОМ DJANGO ============
// Отправляем результат на сервер. Python в api_scores() проверит данные и сохранит их в базу.
scoreForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (sent) return;

  const name = nameInput.value.trim();
  try { localStorage.setItem("playerName", name); } catch (err) {}
  sendMsg.textContent = "Отправляем...";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf                       // без токена Django отклонит запрос
      },
      body: JSON.stringify({ name: name, crystals: score })
    });
    const data = await response.json();

    if (data.ok) {
      sent = true;
      scoreForm.hidden = true;
      sendMsg.textContent = "Готово! Твоё место: " + data.place + ".";
      renderScores(scoresEl, data.scores);        // сразу обновляем таблицу рекордов
    } else {
      sendMsg.textContent = "Ошибка: " + data.error;
    }
  } catch (err) {
    sendMsg.textContent = "Нет связи с сервером. Запущен ли runserver?";
  }
});

startBtn.addEventListener("click", startGame);
requestAnimationFrame(loop);
