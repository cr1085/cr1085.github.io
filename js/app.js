(() => {
  "use strict";
  const searchInput = document.querySelector("#appSearch");
  const cards = [...document.querySelectorAll(".app-card")];
  const filters = [...document.querySelectorAll(".filter-chip")];
  const count = document.querySelector("#visibleCount");
  const emptyState = document.querySelector("#emptyState");
  const menuToggle = document.querySelector("#menuToggle");
  const mainNav = document.querySelector("#mainNav");
  let activeFilter = "todos";

  function filterCards() {
    const term = (searchInput?.value || "").trim().toLocaleLowerCase("es");
    let visible = 0;
    cards.forEach(card => {
      const categoryMatches = activeFilter === "todos" || card.dataset.category === activeFilter;
      const searchText = `${card.dataset.search || ""} ${card.innerText}`.toLocaleLowerCase("es");
      const searchMatches = !term || searchText.includes(term);
      const show = categoryMatches && searchMatches;
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible !== 0;
  }

  searchInput?.addEventListener("input", filterCards);
  filters.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "todos";
      filters.forEach(item => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      filterCards();
    });
  });

  menuToggle?.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menuToggle.textContent = open ? "✕" : "☰";
  });
  mainNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-label", "Abrir menú");
    }
  }));

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
  filterCards();
})();
