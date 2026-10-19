// Navegação e rede interativa exclusivas da página LDRD.
(() => {
  const pagina = document.querySelector(".pagina-ldrd");
  if (!pagina) return;
  pagina.querySelectorAll("[data-ldrd-aba]").forEach((link) => {
    link.addEventListener("click", (evento) => {
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
      const botao = document.getElementById(`aba-${link.dataset.ldrdAba}`);
      if (!botao) return;
      evento.preventDefault();
      botao.click();
      botao.focus({ preventScroll: true });
      botao.closest(".abas__lista").scrollIntoView({ block: "start" });
    });
  });

  const canvas = pagina.querySelector("[data-ldrd-rede]");
  const hero = canvas?.closest(".ldrd-hero");
  const botao = pagina.querySelector("[data-ldrd-movimento]");
  if (!canvas || !hero || !botao) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.hidden = true; return; }
  const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
  let largura = 0, altura = 0, pontos = [], quadro = 0, ultimo = 0;
  let emVista = true, paginaAtiva = true, pausaManual = null;
  const cursor = { x: 0, y: 0, ativo: false };
  const pausado = () => pausaManual ?? preferencia.matches;
  const podeAnimar = () => !pausado() && emVista && paginaAtiva && !document.hidden;

  function desenhar(passo = 0) {
    ctx.clearRect(0, 0, largura, altura);
    const alcance = Math.max(110, Math.min(220, largura * .2));
    pontos.forEach((ponto) => {
      if (passo) {
        if (cursor.ativo) {
          const dx = ponto.x - cursor.x, dy = ponto.y - cursor.y;
          const distancia = Math.hypot(dx, dy);
          if (distancia > .1 && distancia < 165) {
            const forca = (1 - distancia / 165) * .5 * passo;
            ponto.fx += dx / distancia * forca;
            ponto.fy += dy / distancia * forca;
          }
        }
        ponto.fx *= Math.pow(.88, passo);
        ponto.fy *= Math.pow(.88, passo);
        ponto.x += (ponto.vx + ponto.fx) * passo;
        ponto.y += (ponto.vy + ponto.fy) * passo;
        if (ponto.x < -12) ponto.x = largura + 12;
        if (ponto.x > largura + 12) ponto.x = -12;
        if (ponto.y < -12) ponto.y = altura + 12;
        if (ponto.y > altura + 12) ponto.y = -12;
      }
    });
    ctx.lineWidth = .7;
    for (let i = 0; i < pontos.length; i++) {
      for (let j = i + 1; j < pontos.length; j++) {
        const a = pontos[i], b = pontos[j];
        const distancia = Math.hypot(a.x - b.x, a.y - b.y);
        if (distancia < alcance) {
          ctx.strokeStyle = `rgba(205,229,216,${.26 * (1 - distancia / alcance)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    pontos.forEach((ponto) => {
      if (cursor.ativo && !pausado()) {
        const distancia = Math.hypot(ponto.x - cursor.x, ponto.y - cursor.y);
        if (distancia < 180) {
          ctx.strokeStyle = `rgba(242,194,0,${.35 * (1 - distancia / 180)})`;
          ctx.beginPath(); ctx.moveTo(cursor.x, cursor.y); ctx.lineTo(ponto.x, ponto.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(224,239,230,.72)";
      ctx.beginPath(); ctx.arc(ponto.x, ponto.y, ponto.raio, 0, Math.PI * 2); ctx.fill();
    });
  }

  function animar(agora) {
    quadro = 0;
    if (!podeAnimar()) return;
    // Atualiza a 30 fps; o deslocamento considera o tempo entre os desenhos.
    if (!ultimo || agora - ultimo >= 1000 / 30) {
      const passo = ultimo ? Math.min((agora - ultimo) / (1000 / 60), 3) : 1;
      ultimo = agora;
      desenhar(passo);
    }
    quadro = requestAnimationFrame(animar);
  }

  function sincronizar() {
    botao.textContent = pausado() ? "Ativar animação" : "Pausar animação";
    botao.setAttribute("aria-pressed", String(pausado()));
    if (!podeAnimar()) {
      if (quadro) cancelAnimationFrame(quadro);
      quadro = 0; ultimo = 0; cursor.ativo = false;
      desenhar();
    } else if (!quadro) {
      ultimo = 0;
      quadro = requestAnimationFrame(animar);
    }
  }

  function dimensionar() {
    const area = hero.getBoundingClientRect();
    const novaLargura = Math.max(1, Math.round(area.width));
    const novaAltura = Math.max(1, Math.round(area.height));
    if (novaLargura === largura && novaAltura === altura) return;
    const anteriorLargura = largura || novaLargura, anteriorAltura = altura || novaAltura;
    largura = novaLargura; altura = novaAltura;
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(largura * escala); canvas.height = Math.round(altura * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    pontos.forEach((p) => { p.x *= largura / anteriorLargura; p.y *= altura / anteriorAltura; });
    const quantidade = Math.max(24, Math.min(96, Math.round(largura * altura / 10500)));
    pontos = pontos.slice(0, quantidade);
    while (pontos.length < quantidade) {
      const angulo = Math.random() * Math.PI * 2, velocidade = .12 + Math.random() * .18;
      pontos.push({ x: Math.random() * largura, y: Math.random() * altura, vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade, fx: 0, fy: 0, raio: .9 + Math.random() * 1.1 });
    }
    desenhar();
    sincronizar();
  }

  hero.addEventListener("pointermove", (evento) => {
    if (evento.pointerType === "touch" || pausado()) return;
    const area = hero.getBoundingClientRect();
    cursor.x = evento.clientX - area.left; cursor.y = evento.clientY - area.top; cursor.ativo = true;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { cursor.ativo = false; });
  botao.addEventListener("click", () => { pausaManual = !pausado(); sincronizar(); });
  preferencia.addEventListener("change", () => { pausaManual = null; sincronizar(); });
  document.addEventListener("visibilitychange", sincronizar);
  window.addEventListener("pagehide", () => { paginaAtiva = false; sincronizar(); });
  window.addEventListener("pageshow", () => { paginaAtiva = true; sincronizar(); });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(dimensionar).observe(hero);
  else window.addEventListener("resize", dimensionar, { passive: true });
  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver(([entrada]) => { emVista = entrada.isIntersecting; sincronizar(); }).observe(hero);
  }
  botao.hidden = false;
  dimensionar();
})();
