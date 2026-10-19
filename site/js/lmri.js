// Índice local: os links e os detalhes funcionam também sem JavaScript.
(() => {
  const pagina = document.querySelector(".pagina-lmri");
  if (!pagina || typeof IntersectionObserver === "undefined") return;
  const links = [...pagina.querySelectorAll('.lmri-indice a[href^="#"]')];
  const secoes = [...pagina.querySelectorAll("[data-lmri-secao]")];
  const visiveis = new Set();
  const marcar = (id) => links.forEach((link) => {
    if (link.hash === `#${id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) visiveis.add(entrada.target.id);
      else visiveis.delete(entrada.target.id);
    });
    const ativa = secoes.find((secao) => visiveis.has(secao.id));
    marcar(ativa?.id || "");
  }, { rootMargin: "-150px 0px -35% 0px", threshold: 0 });
  secoes.forEach((secao) => observer.observe(secao));
  links.forEach((link) => link.addEventListener("click", () => marcar(link.hash.slice(1))));
})();
