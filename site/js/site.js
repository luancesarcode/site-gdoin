// Comportamentos simples do site: menu no celular, submenus e abas.
// Sem JavaScript o site continua utilizável (submenus abrem por clique
// nativo do <details> e as abas aparecem como seções em sequência).

document.documentElement.classList.add("js");

// Menu do celular
const botaoMenu = document.querySelector(".menu-botao");
const navegacao = document.getElementById("navegacao");

if (botaoMenu && navegacao) {
	botaoMenu.addEventListener("click", () => {
		const aberto = navegacao.classList.toggle("aberta");
		botaoMenu.setAttribute("aria-expanded", String(aberto));
	});
}

// Submenus: só um aberto por vez; fecham ao clicar fora ou com Esc
const submenus = document.querySelectorAll(".menu details");

submenus.forEach((item) => {
	item.addEventListener("toggle", () => {
		if (item.open) {
			submenus.forEach((outro) => {
				if (outro !== item) outro.open = false;
			});
		}
	});
});

document.addEventListener("click", (evento) => {
	submenus.forEach((item) => {
		if (!item.contains(evento.target)) item.open = false;
	});
});

document.addEventListener("keydown", (evento) => {
	if (evento.key === "Escape") submenus.forEach((item) => (item.open = false));
});

// Abas das páginas de laboratório
document.querySelectorAll("[data-abas]").forEach((grupo) => {
	const secoes = Array.from(grupo.querySelectorAll(".aba"));
	const lista = document.createElement("div");
	lista.className = "abas__lista";
	lista.setAttribute("role", "tablist");

	const botoes = secoes.map((secao, indice) => {
		const botao = document.createElement("button");
		botao.type = "button";
		botao.id = `aba-${secao.id}`;
		botao.textContent = secao.dataset.titulo;
		botao.setAttribute("role", "tab");
		botao.setAttribute("aria-controls", secao.id);
		secao.setAttribute("role", "tabpanel");
		secao.setAttribute("aria-labelledby", botao.id);
		botao.addEventListener("click", () => mostrar(indice, true));
		botao.addEventListener("keydown", (evento) => {
			if (evento.key === "ArrowRight") mostrar((indice + 1) % secoes.length, true, true);
			if (evento.key === "ArrowLeft") mostrar((indice - 1 + secoes.length) % secoes.length, true, true);
		});
		lista.appendChild(botao);
		return botao;
	});

	function mostrar(indice, atualizarEndereco, focar) {
		secoes.forEach((secao, i) => {
			const ativo = i === indice;
			secao.hidden = !ativo;
			botoes[i].setAttribute("aria-selected", String(ativo));
			botoes[i].tabIndex = ativo ? 0 : -1;
		});
		if (focar) botoes[indice].focus();
		if (atualizarEndereco) history.replaceState(null, "", `#${secoes[indice].id}`);
	}

	grupo.prepend(lista);
	const inicial = secoes.findIndex((secao) => `#${secao.id}` === location.hash);
	mostrar(inicial >= 0 ? inicial : 0, false);
});

// Publicações: busca, filtro por tipo e "mostrar mais"
document.querySelectorAll("[data-filtro]").forEach((filtro) => {
	const tabela = document.querySelector("[data-pub]");
	if (!tabela) return;

	const linhas = Array.from(tabela.tBodies[0].rows);
	const busca = filtro.querySelector("[data-busca]");
	const tipo = filtro.querySelector("[data-tipo]");
	const contagem = filtro.querySelector("[data-contagem]");
	const vazio = document.querySelector("[data-vazio]");
	const mais = document.querySelector("[data-mais]");
	const PASSO = 25;
	let limite = PASSO;

	const normalizar = (texto) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	const textos = linhas.map((linha) => normalizar(linha.textContent));

	function aplicar() {
		const termo = normalizar(busca.value.trim());
		const alvo = tipo.value;
		let achados = 0;
		let mostrados = 0;

		linhas.forEach((linha, i) => {
			const ok = (!termo || textos[i].includes(termo)) && (!alvo || linha.dataset.tipo === alvo);
			if (ok) achados += 1;
			const visivel = ok && mostrados < limite;
			if (visivel) mostrados += 1;
			linha.hidden = !visivel;
		});

		contagem.textContent = achados === linhas.length ? `${achados} trabalhos` : `${achados} de ${linhas.length} trabalhos`;
		vazio.hidden = achados !== 0;
		mais.hidden = mostrados >= achados;
	}

	busca.addEventListener("input", () => {
		limite = PASSO;
		aplicar();
	});
	tipo.addEventListener("change", () => {
		limite = PASSO;
		aplicar();
	});
	mais.addEventListener("click", () => {
		limite += PASSO;
		aplicar();
	});
	aplicar();
});
