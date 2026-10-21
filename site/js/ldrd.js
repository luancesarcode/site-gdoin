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
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.hidden = true; return; }

  // Rede de partículas densa, no estilo do site original.
  // Desempenho: grade espacial para achar vizinhos, linhas agrupadas em poucas
  // faixas de opacidade (um traço por faixa por quadro) e resolução limitada.
  // Com "reduzir movimento" ativado no sistema, a rede é desenhada parada.
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");
  const FAIXAS = 6;
  let largura = 0, altura = 0, alcance = 160, pontos = [], quadro = 0, ultimo = 0;
  let emVista = true;
  const cursor = { x: 0, y: 0, ativo: false };
  const caminhos = Array.from({ length: FAIXAS }, () => []);
  const podeAnimar = () => !reduzir.matches && emVista && !document.hidden;

  function mover(passo) {
    for (const p of pontos) {
      if (cursor.ativo) {
        const dx = p.x - cursor.x, dy = p.y - cursor.y, d2 = dx * dx + dy * dy;
        if (d2 > .01 && d2 < 27225) {
          const d = Math.sqrt(d2), forca = (1 - d / 165) * .5 * passo;
          p.fx += dx / d * forca; p.fy += dy / d * forca;
        }
      }
      const atrito = Math.pow(.88, passo);
      p.fx *= atrito; p.fy *= atrito;
      p.x += (p.vx + p.fx) * passo; p.y += (p.vy + p.fy) * passo;
      if (p.x < -12) p.x = largura + 12; else if (p.x > largura + 12) p.x = -12;
      if (p.y < -12) p.y = altura + 12; else if (p.y > altura + 12) p.y = -12;
    }
  }

  function desenhar() {
    ctx.clearRect(0, 0, largura, altura);
    const alcance2 = alcance * alcance;
    // grade: cada célula tem o tamanho do alcance, então só células vizinhas importam
    const colunas = Math.ceil((largura + 24) / alcance) + 1;
    const grade = new Map();
    pontos.forEach((p, i) => {
      const chave = Math.floor((p.x + 12) / alcance) + Math.floor((p.y + 12) / alcance) * colunas;
      let lista = grade.get(chave);
      if (!lista) grade.set(chave, (lista = []));
      lista.push(i);
    });
    caminhos.forEach((c) => (c.length = 0));
    const vizinhas = [0, 1, colunas - 1, colunas, colunas + 1];
    grade.forEach((lista, chave) => {
      for (const deslocamento of vizinhas) {
        const outra = deslocamento === 0 ? lista : grade.get(chave + deslocamento);
        if (!outra) continue;
        for (let a = 0; a < lista.length; a++) {
          const pa = pontos[lista[a]];
          for (let b = deslocamento === 0 ? a + 1 : 0; b < outra.length; b++) {
            const pb = pontos[outra[b]];
            const dx = pa.x - pb.x, dy = pa.y - pb.y, d2 = dx * dx + dy * dy;
            if (d2 < alcance2) {
              const faixa = Math.min(FAIXAS - 1, Math.floor(Math.sqrt(d2) / alcance * FAIXAS));
              caminhos[faixa].push(pa.x, pa.y, pb.x, pb.y);
            }
          }
        }
      }
    });
    ctx.lineWidth = .8;
    for (let f = 0; f < FAIXAS; f++) {
      const c = caminhos[f];
      if (!c.length) continue;
      ctx.strokeStyle = `rgba(214,234,223,${(.5 * (1 - (f + .5) / FAIXAS)).toFixed(3)})`;
      ctx.beginPath();
      for (let k = 0; k < c.length; k += 4) { ctx.moveTo(c[k], c[k + 1]); ctx.lineTo(c[k + 2], c[k + 3]); }
      ctx.stroke();
    }
    if (cursor.ativo) {
      ctx.strokeStyle = "rgba(242,194,0,.22)";
      ctx.beginPath();
      for (const p of pontos) {
        const dx = p.x - cursor.x, dy = p.y - cursor.y;
        if (dx * dx + dy * dy < 32400) { ctx.moveTo(cursor.x, cursor.y); ctx.lineTo(p.x, p.y); }
      }
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(236,245,240,.9)";
    ctx.beginPath();
    for (const p of pontos) { ctx.moveTo(p.x + p.raio, p.y); ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2); }
    ctx.fill();
  }

  function animar(agora) {
    quadro = 0;
    if (!podeAnimar()) return;
    const passo = ultimo ? Math.min((agora - ultimo) / (1000 / 60), 3) : 1;
    ultimo = agora;
    mover(passo);
    desenhar();
    quadro = requestAnimationFrame(animar);
  }

  function sincronizar() {
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
    alcance = Math.max(130, Math.min(230, largura * .13));
    // resolução limitada: linhas finas não ganham nada acima de 1,5x
    const escala = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(largura * escala); canvas.height = Math.round(altura * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    pontos.forEach((p) => { p.x *= largura / anteriorLargura; p.y *= altura / anteriorAltura; });
    const quantidade = Math.max(70, Math.min(210, Math.round(largura * altura / 5600)));
    pontos = pontos.slice(0, quantidade);
    while (pontos.length < quantidade) {
      const angulo = Math.random() * Math.PI * 2, velocidade = .12 + Math.random() * .18;
      pontos.push({ x: Math.random() * largura, y: Math.random() * altura, vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade, fx: 0, fy: 0, raio: 1.1 + Math.random() * 1.6 });
    }
    desenhar();
    sincronizar();
  }

  hero.addEventListener("pointermove", (evento) => {
    if (evento.pointerType === "touch" || reduzir.matches) return;
    const area = hero.getBoundingClientRect();
    cursor.x = evento.clientX - area.left; cursor.y = evento.clientY - area.top; cursor.ativo = true;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { cursor.ativo = false; });
  reduzir.addEventListener("change", sincronizar);
  document.addEventListener("visibilitychange", sincronizar);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(dimensionar).observe(hero);
  else window.addEventListener("resize", dimensionar, { passive: true });
  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver(([entrada]) => { emVista = entrada.isIntersecting; sincronizar(); }).observe(hero);
  }
  dimensionar();
})();
