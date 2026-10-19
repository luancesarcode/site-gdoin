// Filtros progressivos: sem JS, todos os laboratórios permanecem visíveis.
(() => {
  const rede = document.querySelector(".rede-labs");
  if (!rede) return;
  const controles = rede.querySelector(".rede-labs__filtros");
  const grupos = Array.from(rede.querySelectorAll("[data-lab-grupo]"));
  const status = rede.querySelector("[data-lab-status]");
  const botoes = Array.from(controles.querySelectorAll("button"));
  controles.hidden = false;
  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const filtro = botao.dataset.labFiltro;
      botoes.forEach((outro) => outro.setAttribute("aria-pressed", String(outro === botao)));
      let quantidade = 0;
      grupos.forEach((grupo) => {
        grupo.hidden = filtro !== "todos" && grupo.dataset.labGrupo !== filtro;
        if (!grupo.hidden) quantidade += grupo.querySelectorAll("[data-laboratorio]").length;
      });
      status.textContent = `${quantidade} laboratórios exibidos. ${botao.textContent.trim()}.`;
    });
  });
})();
