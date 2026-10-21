// LMRI, área do cliente: validação dos formulários, troca entre entrar e
// redefinir senha, e cadastro em etapas. Sem JavaScript, os formulários
// aparecem completos e em sequência.
// Ainda não há sistema por trás: ao enviar, a página explica como falar com
// o laboratório. Na versão WordPress, os envios vão para o sistema do LMRI.

(() => {
	const paginaAcesso = document.querySelector(".pagina-lmri-acesso");
	if (!paginaAcesso) return;

	const modeloAviso = document.getElementById("aviso-demo");

	// ------------------------------------------------------------ validação
	function mensagemPadrao(campo) {
		const erro = document.getElementById(`${campo.id}-erro`);
		return erro ? erro.dataset.padrao || (erro.dataset.padrao = erro.textContent) : "";
	}

	function validarCampo(campo) {
		const erro = document.getElementById(`${campo.id}-erro`);
		let valido = campo.checkValidity();
		const igual = campo.dataset.igual && document.getElementById(campo.dataset.igual);
		if (valido && igual && campo.value !== igual.value) valido = false;
		if (campo.id.endsWith("-cnpj") && valido && campo.value) {
			valido = campo.value.replace(/\D/g, "").length === 14;
		}
		campo.setAttribute("aria-invalid", String(!valido));
		if (erro) {
			erro.textContent = mensagemPadrao(campo);
			erro.hidden = valido;
		}
		if (valido) campo.removeAttribute("aria-invalid");
		return valido;
	}

	function validarGrupo(grupo) {
		const campos = [...grupo.querySelectorAll("input:not([type=checkbox]), select")]
			.filter((campo) => !campo.closest("[hidden]"));
		const invalidos = campos.filter((campo) => !validarCampo(campo));
		if (invalidos.length) invalidos[0].focus();
		return invalidos.length === 0;
	}

	// revalida enquanto a pessoa corrige um campo que já mostrou erro
	paginaAcesso.addEventListener("input", (evento) => {
		const campo = evento.target;
		if (campo.matches("[aria-invalid=true]")) validarCampo(campo);
	});
	paginaAcesso.addEventListener("change", (evento) => {
		const campo = evento.target;
		if (campo.matches("select[aria-invalid=true]")) validarCampo(campo);
	});

	function mostrarAviso(form) {
		const aviso = form.querySelector(".acesso__aviso");
		if (!aviso || !modeloAviso) return;
		aviso.innerHTML = modeloAviso.innerHTML;
		aviso.hidden = false;
		aviso.setAttribute("tabindex", "-1");
		aviso.focus();
	}

	// ------------------------------------------------------------ entrar / redefinir
	const cartao = paginaAcesso.querySelector(".acesso__cartao");
	if (cartao) {
		const trocar = (destino, focar = true) => {
			cartao.classList.toggle("recuperando", destino === "recuperar");
			cartao.querySelectorAll(".acesso__aviso").forEach((aviso) => (aviso.hidden = true));
			const form = cartao.querySelector(`[data-acesso="${destino}"]`);
			if (focar) form.querySelector("input").focus();
		};
		paginaAcesso.querySelectorAll("[data-acesso-ir]").forEach((link) => {
			link.addEventListener("click", (evento) => {
				evento.preventDefault();
				trocar(link.dataset.acessoIr);
				history.replaceState(null, "", link.dataset.acessoIr === "recuperar" ? "#recuperar" : location.pathname);
			});
		});
		if (location.hash === "#recuperar") trocar("recuperar", false);

		// mostrar ou ocultar a senha
		cartao.querySelectorAll(".campo__mostrar").forEach((botao) => {
			const campo = document.getElementById(botao.getAttribute("aria-controls"));
			botao.hidden = false;
			botao.addEventListener("click", () => {
				const mostrar = campo.type === "password";
				campo.type = mostrar ? "text" : "password";
				botao.textContent = mostrar ? "Ocultar" : "Mostrar";
				botao.setAttribute("aria-pressed", String(mostrar));
			});
		});

		cartao.querySelectorAll("form").forEach((form) => {
			form.addEventListener("submit", (evento) => {
				evento.preventDefault();
				if (validarGrupo(form)) mostrarAviso(form);
			});
		});
	}

	// ------------------------------------------------------------ cadastro em etapas
	const cadastro = paginaAcesso.querySelector("[data-cadastro]");
	if (!cadastro) return;

	const etapas = [...cadastro.querySelectorAll(".etapa")];
	const passos = [...document.querySelectorAll(".etapas li")];
	let atual = 0;

	function irPara(indice, focar = true) {
		atual = indice;
		etapas.forEach((etapa, i) => etapa.classList.toggle("ativa", i === indice));
		passos.forEach((passo, i) => {
			passo.classList.toggle("feita", i < indice);
			if (i === indice) passo.setAttribute("aria-current", "step");
			else passo.removeAttribute("aria-current");
		});
		cadastro.querySelector(".acesso__aviso").hidden = true;
		if (focar) {
			const legenda = etapas[indice].querySelector("legend");
			legenda.setAttribute("tabindex", "-1");
			legenda.focus({ preventScroll: true });
			cadastro.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
		}
	}

	cadastro.querySelectorAll("[data-etapa-avancar]").forEach((botao) => {
		botao.addEventListener("click", () => {
			if (validarGrupo(etapas[atual])) irPara(atual + 1);
		});
	});
	cadastro.querySelectorAll("[data-etapa-voltar]").forEach((botao) => {
		botao.addEventListener("click", () => irPara(atual - 1));
	});

	// cobrança igual aos dados do cliente
	cadastro.querySelectorAll("[data-esconde]").forEach((marcador) => {
		const alvo = document.getElementById(marcador.dataset.esconde);
		const aplicar = () => (alvo.hidden = marcador.checked);
		marcador.addEventListener("change", aplicar);
		aplicar();
	});

	cadastro.addEventListener("submit", (evento) => {
		evento.preventDefault();
		// confere tudo; se algo ficou para trás, volta para a etapa com erro
		for (let i = 0; i < etapas.length; i += 1) {
			if (!validarGrupo(etapas[i])) {
				if (i !== atual) {
					irPara(i, false);
					validarGrupo(etapas[i]);
				}
				return;
			}
		}
		mostrarAviso(cadastro);
	});

	irPara(0, false);
})();
