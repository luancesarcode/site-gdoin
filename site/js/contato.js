// Mensagens preparadas no navegador e enviadas pelo aplicativo de e-mail.
// Os únicos destinatários disponíveis são os contatos já publicados no site.
(() => {
  const form = document.querySelector("[data-contato-form]");
  if (!form) return;
  const laboratorio = form.elements.namedItem("laboratorio");
  const destino = form.querySelector("[data-contato-destino]");
  const status = form.querySelector("[data-contato-status]");
  const atualizarDestino = () => {
    const opcao = laboratorio.selectedOptions[0];
    destino.textContent = opcao.dataset.email ? `Destinatário: ${opcao.dataset.email}` : "Escolha o laboratório que receberá sua mensagem.";
    status.textContent = "";
  };
  form.hidden = false;
  laboratorio.addEventListener("change", atualizarDestino);
  form.addEventListener("input", (evento) => {
    if (typeof evento.target.setCustomValidity === "function") evento.target.setCustomValidity("");
    status.textContent = "";
  });
  document.querySelectorAll("[data-contato-escrever]").forEach((botao) => {
    botao.hidden = false;
    botao.addEventListener("click", () => {
      laboratorio.value = botao.dataset.contatoEscrever;
      atualizarDestino();
      form.scrollIntoView({ block: "start" });
      form.elements.namedItem("nome").focus({ preventScroll: true });
    });
  });
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    for (const campo of form.querySelectorAll("[required]")) {
      campo.setCustomValidity(campo.value.trim() ? "" : "Preencha este campo.");
    }
    if (!form.reportValidity()) return;
    const opcao = laboratorio.selectedOptions[0];
    const email = opcao.dataset.email;
    if (!email) return;
    const dados = new FormData(form);
    const valor = (chave) => String(dados.get(chave) || "").trim();
    const corpo = [
      `Nome: ${valor("nome")}`,
      `Instituição: ${valor("instituicao") || "Não informada"}`,
      `E-mail para resposta: ${valor("email")}`,
      `Telefone: ${valor("telefone") || "Não informado"}`,
      "", valor("mensagem")
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = `mailto:${email}?subject=${encodeURIComponent(`[${opcao.textContent.trim()}] ${valor("assunto")}`)}&body=${encodeURIComponent(corpo)}`;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    status.textContent = `Mensagem preparada para ${email}. Revise e envie no seu aplicativo de e-mail.`;
  });
  atualizarDestino();
})();
