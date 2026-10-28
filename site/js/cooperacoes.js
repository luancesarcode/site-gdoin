// Filtros por país e controles das animações do mapa, sem dependências.
document.querySelectorAll("[data-cooperacoes]").forEach((section) => {
  const map = section.querySelector("[data-mapa-rede]");
  const filters = section.querySelector("[data-mapa-filtros]");
  const buttons = Array.from(filters.querySelectorAll("button[data-pais-filtro]"));
  const groups = Array.from(section.querySelectorAll("[data-instituicoes-pais]"));
  const highlights = Array.from(map.querySelectorAll("[data-mapa-pais]"));
  const status = section.querySelector("[data-mapa-status]");
  const pause = map.querySelector("[data-mapa-pausa]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function selectCountry(country, label) {
    section.dataset.paisSelecionado = country;
    let count = 0;
    let countries = 0;
    groups.forEach((group) => {
      const visible = country === "todos" || group.dataset.instituicoesPais === country;
      group.hidden = !visible;
      if (visible) {
        count += group.querySelectorAll("li").length;
        countries += 1;
      }
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.paisFiltro === country));
    });
    highlights.forEach((element) => {
      element.classList.toggle("mapa-atenuado", country !== "todos" && element.dataset.mapaPais !== country);
    });
    status.textContent = country === "todos"
      ? `${count} instituições em ${countries} países`
      : `${count} ${count === 1 ? "instituição" : "instituições"} · ${label}`;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectCountry(button.dataset.paisFiltro, button.textContent.trim()));
  });
  filters.hidden = false;
  selectCountry("todos", "Todos os países");

  function updateMotionPreference() {
    pause.hidden = reducedMotion.matches;
  }
  pause.addEventListener("click", () => {
    const paused = map.dataset.pausado !== "true";
    map.dataset.pausado = String(paused);
    pause.textContent = paused ? "Retomar animação" : "Pausar animação";
  });
  reducedMotion.addEventListener("change", updateMotionPreference);
  updateMotionPreference();
  map.classList.add("mapa-pronto");

  // O movimento só é executado quando o mapa está visível.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      map.classList.toggle("mapa-visivel", entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(map);
  } else {
    map.classList.add("mapa-visivel");
  }
});
