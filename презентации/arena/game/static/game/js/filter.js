// Поиск бойцов на главной странице.
// Карточки уже нарисованы Django. JavaScript только прячет лишние.

const searchInput = document.getElementById("search");
const cards = document.querySelectorAll("#cards .card");
const noResults = document.getElementById("noResults");

searchInput.addEventListener("input", function () {
  const query = searchInput.value.trim().toLowerCase();
  let shown = 0;

  cards.forEach(function (card) {
    // data-search заполнил шаблон Django: имя и роль маленькими буквами
    const match = card.dataset.search.includes(query);
    card.hidden = !match;
    if (match) shown++;
  });

  noResults.hidden = shown > 0;
});
