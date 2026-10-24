// Общие функции для таблицы рекордов.

// Перерисовать список по данным от сервера: [{name: "...", crystals: 12}, ...]
function renderScores(listEl, scores) {
  listEl.innerHTML = "";

  if (scores.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Пока никого. Будь первым!";
    listEl.append(li);
    return;
  }

  scores.forEach(function (s) {
    const li = document.createElement("li");
    const who = document.createElement("span");
    const pts = document.createElement("span");
    who.className = "who";
    pts.className = "pts";
    // textContent вставляет текст как есть, поэтому чужое имя не сможет сломать страницу
    who.textContent = s.name;
    pts.textContent = s.crystals;
    li.append(who, pts);
    listEl.append(li);
  });
}

// Спросить у сервера свежую таблицу (GET /api/scores/) и показать её
async function refreshScores(listEl) {
  try {
    const response = await fetch(listEl.dataset.api);
    const data = await response.json();
    renderScores(listEl, data.scores);
  } catch (err) {
    console.log("Не удалось обновить таблицу:", err);
  }
}
