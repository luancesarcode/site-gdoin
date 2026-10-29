(() => {
  const filtros = document.querySelector('[data-filtros]');
  if (!filtros) return;
  const busca = document.querySelector('#busca-anais');
  const area = document.querySelector('#area-anais');
  const contagem = document.querySelector('[data-contagem]');
  const vazio = document.querySelector('[data-vazio]');
  const paginacao = document.querySelector('[data-paginacao]');
  const paginaTexto = document.querySelector('[data-pagina]');
  const anterior = document.querySelector('[data-anterior]');
  const proxima = document.querySelector('[data-proxima]');
  const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const itens = [...document.querySelectorAll('.anais-item')].map(el => ({
    el,
    area: el.dataset.area,
    texto: normalizar(`${el.textContent} ${el.dataset.palavras}`)
  }));
  let pagina = 1;
  const porPagina = 12;

  function renderizar() {
    const palavras = normalizar(busca.value).trim().split(/\s+/).filter(Boolean);
    const encontrados = itens.filter(item => (!area.value || item.area === area.value) && palavras.every(p => item.texto.includes(p)));
    const paginas = Math.max(1, Math.ceil(encontrados.length / porPagina));
    pagina = Math.min(pagina, paginas);
    itens.forEach(item => { item.el.hidden = true; });
    const inicio = (pagina - 1) * porPagina;
    encontrados.slice(inicio, inicio + porPagina).forEach(item => { item.el.hidden = false; });
    const total = encontrados.length;
    contagem.textContent = total ? `${inicio + 1}–${Math.min(inicio + porPagina, total)} de ${total} ${total === 1 ? 'documento' : 'documentos'}` : '0 documentos';
    vazio.hidden = total > 0;
    paginacao.hidden = paginas <= 1;
    paginaTexto.textContent = `Página ${pagina} de ${paginas}`;
    anterior.disabled = pagina === 1;
    proxima.disabled = pagina === paginas;
  }

  [busca, area].forEach(campo => campo.addEventListener(campo === busca ? 'input' : 'change', () => {
    pagina = 1;
    renderizar();
  }));
  function mudarPagina(delta) {
    pagina += delta;
    renderizar();
    const titulo = document.querySelector('#t-resumos');
    titulo.focus({ preventScroll: true });
    titulo.scrollIntoView({ block: 'start' });
  }
  anterior.addEventListener('click', () => mudarPagina(-1));
  proxima.addEventListener('click', () => mudarPagina(1));
  filtros.hidden = false;
  renderizar();
})();
