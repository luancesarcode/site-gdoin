// Colunas contínuas com imagens inteiras; o destaque não é substituído.
document.querySelectorAll("[data-galeria-viva]").forEach((gallery) => {
  const columns = Array.from(gallery.querySelectorAll("[data-galeria-coluna]"));
  const groups = columns.map((column) => column.querySelector(".galeria-viva__grupo"));
  const originals = groups.map((group) => Array.from(group.children));
  const pause = gallery.querySelector("[data-galeria-pausa]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 640px)");

  function updateDurations() {
    if (!gallery.classList.contains("galeria-animada")) return;
    columns.forEach((column, index) => {
      if (column.hidden) return;
      const height = groups[index].getBoundingClientRect().height;
      column.style.setProperty("--galeria-duracao", `${Math.max(24, height / 15).toFixed(2)}s`);
    });
  }

  function rebuild() {
    gallery.querySelectorAll("[data-galeria-copia]").forEach((copy) => copy.remove());
    originals.forEach((items, index) => groups[index].append(...items));
    const animated = !reduced.matches;
    const singleColumn = animated && mobile.matches;
    if (singleColumn) groups[0].append(...originals[1]);
    columns[1].hidden = singleColumn;
    gallery.classList.toggle("galeria-animada", animated);
    pause.hidden = !animated;
    if (animated) {
      columns.forEach((column, index) => {
        if (column.hidden) return;
        const copy = groups[index].cloneNode(true);
        copy.dataset.galeriaCopia = "";
        copy.setAttribute("aria-hidden", "true");
        copy.inert = true;
        copy.querySelectorAll("img").forEach((img) => {
          img.alt = "";
          img.loading = "eager";
        });
        groups[index].after(copy);
      });
      updateDurations();
    }
  }

  pause.addEventListener("click", () => {
    const paused = gallery.dataset.pausada !== "true";
    gallery.dataset.pausada = String(paused);
    pause.textContent = paused ? "Retomar movimento" : "Pausar movimento";
  });
  reduced.addEventListener("change", rebuild);
  mobile.addEventListener("change", rebuild);
  rebuild();
  if ("ResizeObserver" in window) new ResizeObserver(updateDurations).observe(gallery);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      gallery.dataset.visivel = String(entry.isIntersecting);
    }, { threshold: 0.05 }).observe(gallery);
  }
  const updateVisibility = () => { gallery.dataset.oculta = String(document.hidden); };
  document.addEventListener("visibilitychange", updateVisibility);
  updateVisibility();
});
