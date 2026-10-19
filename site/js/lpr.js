// Os atalhos da página usam o controlador de abas compartilhado de site.js.
(() => {
  const pagina = document.querySelector(".pagina-lpr");
  if (!pagina) return;
  pagina.querySelectorAll("[data-lpr-aba]").forEach((link) => {
    link.addEventListener("click", (evento) => {
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
      const botao = document.getElementById(`aba-${link.dataset.lprAba}`);
      if (!botao) return;
      evento.preventDefault();
      botao.click();
      botao.focus({ preventScroll: true });
      botao.closest(".abas__lista").scrollIntoView({ block: "start" });
    });
  });
})();
