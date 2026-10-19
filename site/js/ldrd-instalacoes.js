// Recursos exclusivos do LDRD; a navegação e as abas continuam em site.js.
(() => {
  const secao = document.querySelector("#instalacoes");
  if (!secao) return;

  // O controlador compartilhado usa botões para alternar as abas.
  // Este link mantém o mesmo caminho, inclusive para teclado e leitores de tela.
  secao.querySelectorAll("[data-inst-aba]").forEach((link) => {
    link.addEventListener("click", (evento) => {
      const botao = document.getElementById(`aba-${link.dataset.instAba}`);
      if (!botao) return;
      evento.preventDefault();
      botao.click();
      botao.focus();
      botao.scrollIntoView({ block: "center" });
    });
  });

  // Sem suporte a dialog ou sem JS, cada fotografia abre seu arquivo original.
  if (typeof HTMLDialogElement === "undefined") return;
  const dialogo = document.createElement("dialog");
  dialogo.className = "inst-visualizador";
  dialogo.setAttribute("aria-label", "Fotografia do equipamento");
  dialogo.innerHTML = '<form method="dialog"><button type="submit" autofocus>Fechar fotografia</button></form><figure><img alt=""><figcaption id="inst-foto-descricao"></figcaption></figure>';
  dialogo.setAttribute("aria-describedby", "inst-foto-descricao");
  document.body.appendChild(dialogo);
  const imagem = dialogo.querySelector("img");
  const legenda = dialogo.querySelector("figcaption");

  secao.querySelectorAll("[data-inst-foto]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (evento) => {
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
      evento.preventDefault();
      const original = link.querySelector("img");
      imagem.src = link.href;
      imagem.alt = original.alt;
      legenda.textContent = original.alt;
      dialogo.showModal();
    });
  });
  dialogo.addEventListener("click", (evento) => {
    if (evento.target !== dialogo) return;
    const area = dialogo.getBoundingClientRect();
    if (evento.clientX < area.left || evento.clientX > area.right || evento.clientY < area.top || evento.clientY > area.bottom) dialogo.close();
  });
})();
