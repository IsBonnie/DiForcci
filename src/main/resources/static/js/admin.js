
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    configurarTelaProdutos();

    const links = document.querySelectorAll("[data-modulo]");
    const mensagem = document.getElementById("mensagem-modulo");

    links.forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const modulo = link.dataset.modulo;

        if (modulo === "Produtos") {
            document.getElementById("secao-estoque").hidden = true;
            document.querySelector(".indicadores").hidden = true;
            document.querySelector(".painel:not(#secao-produtos)").hidden = true;
            document.getElementById("secao-produtos").hidden = false;
            document.querySelector(".topbar h1").textContent = "Produtos";
            document.querySelector(".topbar p").textContent =
                "Cadastro e consulta de produtos";
                document.querySelectorAll(".menu a").forEach(item => {
                item.classList.remove("ativo");
            });

            link.classList.add("ativo");
            listarProdutosNaTabela();

            } else if (modulo === "Estoque") {

    // Esconde a visão geral
    document.querySelector(".indicadores").hidden = true;
    document.querySelector(".painel:not(#secao-produtos):not(#secao-estoque)").hidden = true;

    // Esconde Produtos e mostra Estoque
    document.getElementById("secao-produtos").hidden = true;
    document.getElementById("secao-estoque").hidden = false;

    // Atualiza o cabeçalho
    document.querySelector(".topbar h1").textContent = "Estoque";
    document.querySelector(".topbar p").textContent =
        "Consulta e gerenciamento de estoque";

    // Atualiza o menu selecionado
    document.querySelectorAll(".menu a").forEach(item => {
        item.classList.remove("ativo");
    });

    link.classList.add("ativo");
    carregarEstoque();
        } else {
            document.getElementById("secao-produtos").hidden = true;
            document.querySelector(".indicadores").hidden = false;
            document.querySelector(".painel:not(#secao-produtos)").hidden = false;
            document.querySelector(".topbar h1").textContent = modulo;
            document.querySelector(".topbar p").textContent =
                 "Módulo em desenvolvimento";

            mensagem.textContent =
                `O módulo ${modulo} será implementado nas próximas etapas.`;

            document.querySelectorAll(".menu a").forEach(item => {
                item.classList.remove("ativo");
            });

            link.classList.add("ativo");
        }
        
        });

});

    fetch("/csrf", { credentials: "same-origin" })
    .then(resposta => resposta.json())
    .then(csrf => {
        const formulario = document.querySelector(".logout-form");
        const campo = document.createElement("input");

        campo.type = "hidden";
        campo.name = csrf.parameterName;
        campo.value = csrf.token;

        formulario.appendChild(campo);
    })
    .catch(erro => console.error("Erro ao preparar logout:", erro));
});

async function carregarProdutos() {
    const indicador = document.getElementById("total-produtos");

    try {
        const resposta = await fetch("/produtos", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (Array.isArray(dados)) {
            indicador.textContent = dados.length;
        } else if (Array.isArray(dados.content)) {
            indicador.textContent = dados.totalElements ?? dados.content.length;
        } else {
            indicador.textContent = "—";
            console.warn("Formato inesperado em /produtos:", dados);
        }

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        indicador.textContent = "—";
    }
}

async function listarProdutosNaTabela() {
    const tbody = document.getElementById("lista-produtos");
    const aviso = document.getElementById("aviso-produtos");

    tbody.innerHTML = "";
    aviso.textContent = "Carregando produtos...";

    try {
        const resposta = await fetch("/produtos", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const produtos = await resposta.json();

        if (!Array.isArray(produtos)) {
            throw new Error("A API não retornou uma lista de produtos.");
        }

        produtosCadastrados = produtos;

        aviso.textContent = "";

        if (produtos.length === 0) {
            const linha = tbody.insertRow();
            const celula = linha.insertCell();
            celula.colSpan = 5;
            celula.textContent = "Nenhum produto cadastrado.";
            return;
        }

        renderizarTabelaProdutos(produtos);

    } catch (erro) {
        console.error("Erro ao listar produtos:", erro);
        aviso.textContent = "Não foi possível carregar os produtos.";
    }
}

let produtosCadastrados = [];
let produtoEmEdicao = null;

function configurarTelaProdutos() {
    const btnNovo = document.getElementById("btn-novo-produto");
    const btnCancelar = document.getElementById("btn-cancelar-produto");
    const formulario = document.getElementById("form-produto");
    const pesquisa = document.getElementById("pesquisa-produtos");
    const areaCadastro = document.getElementById("area-cadastro-produto");

    btnNovo.addEventListener("click", () => {
        produtoEmEdicao = null;
        document.querySelector("#area-cadastro-produto h3").textContent =
        "Cadastrar novo produto";
        document.getElementById("btn-salvar-produto").textContent =
        "Salvar produto";
        formulario.reset();
        areaCadastro.hidden = false;
        document.getElementById("produto-nome").focus();
    });

    btnCancelar.addEventListener("click", () => {
        formulario.reset();
        areaCadastro.hidden = true;
        produtoEmEdicao = null;
    });

    pesquisa.addEventListener("input", () => {
        const termo = pesquisa.value.toLowerCase().trim();

        const filtrados = produtosCadastrados.filter(produto =>
            String(produto.nome ?? "").toLowerCase().includes(termo) ||
            String(produto.id ?? "").includes(termo) ||
            String(produto.ncm ?? "").includes(termo)
        );

        renderizarTabelaProdutos(filtrados);
    });

    formulario.addEventListener("submit", salvarNovoProduto);
}

function renderizarTabelaProdutos(produtos) {
    const tbody = document.getElementById("lista-produtos");
    tbody.innerHTML = "";

    if (produtos.length === 0) {
        const linha = tbody.insertRow();
        const celula = linha.insertCell();
        celula.colSpan = 5;
        celula.textContent = "Nenhum produto encontrado.";
        return;
    }

    produtos.forEach(produto => {
        const linha = tbody.insertRow();

        [
            produto.id,
            produto.nome,
            produto.unidade,
            produto.ncm
        ].forEach(valor => {
            const celula = linha.insertCell();
            celula.textContent = valor ?? "—";
        });

            const acoes = linha.insertCell();

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.textContent = "Editar";
            btnEditar.className = "btn-editar";
            btnEditar.addEventListener("click", () => editarProduto(produto));

            acoes.appendChild(btnEditar);
            const btnExcluir = document.createElement("button");
            btnExcluir.type = "button";
            btnExcluir.textContent = "Excluir";
            btnExcluir.className = "btn-excluir";

            btnExcluir.addEventListener("click", () => {
             excluirProduto(produto);
            });

acoes.appendChild(btnExcluir);
          });
}

async function salvarNovoProduto(event) {
    event.preventDefault();

    const aviso = document.getElementById("aviso-produtos");
    const botao = document.getElementById("btn-salvar-produto");

    const produto = {
        nome: document.getElementById("produto-nome").value.trim(),
        unidade: document.getElementById("produto-unidade").value,
        ncm: document.getElementById("produto-ncm").value.trim()
    };

    botao.disabled = true;
    aviso.textContent = "Salvando produto...";

    try {
        const respostaCsrf = await fetch("/csrf", {
            credentials: "same-origin"
        });

        if (!respostaCsrf.ok) {
            throw new Error("Não foi possível obter o token de segurança.");
        }

        const csrf = await respostaCsrf.json();

        const editando = produtoEmEdicao !== null;
        const url = editando
         ? `/produtos/${produtoEmEdicao}`
         : "/produtos";

        const resposta = await fetch(url, {
        method: editando ? "PUT" : "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                [csrf.headerName]: csrf.token
            },
            body: JSON.stringify(produto)
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        document.getElementById("form-produto").reset();
        document.getElementById("area-cadastro-produto").hidden = true;

        produtoEmEdicao = null;

        await listarProdutosNaTabela();
        await carregarProdutos();

        aviso.textContent = editando
             ? "Produto atualizado com sucesso!"
             : "Produto cadastrado com sucesso!";

    } catch (erro) {
        console.error("Erro ao cadastrar produto:", erro);
        aviso.textContent = "Erro ao cadastrar produto: " + erro.message;
    } finally {
        botao.disabled = false;
    }
}

function editarProduto(produto) {
    produtoEmEdicao = produto.id;

    document.getElementById("produto-nome").value = produto.nome ?? "";
    document.getElementById("produto-unidade").value =
        produto.unidade ?? "";
    document.getElementById("produto-ncm").value = produto.ncm ?? "";

    document.querySelector("#area-cadastro-produto h3").textContent =
        "Editar produto";

    document.getElementById("btn-salvar-produto").textContent =
        "Salvar alterações";

    document.getElementById("area-cadastro-produto").hidden = false;
    document.getElementById("area-cadastro-produto").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function excluirProduto(produto) {
    const confirmar = confirm(
        `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmar) {
        return;
    }

    const aviso = document.getElementById("aviso-produtos");

    aviso.textContent = "Verificando e excluindo produto...";

    try {
        const respostaCsrf = await fetch("/csrf", {
            credentials: "same-origin"
        });

        if (!respostaCsrf.ok) {
            throw new Error("Erro ao obter token de segurança.");
        }

        const csrf = await respostaCsrf.json();

        const resposta = await fetch(`/produtos/${produto.id}`, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                [csrf.headerName]: csrf.token
            }
        });

        if (resposta.status === 409) {
            throw new Error(
                "Este produto possui remessa, estoque ou histórico vinculado e não pode ser excluído."
            );
        }

        if (resposta.status === 404) {
            throw new Error("Produto não encontrado.");
        }

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        await listarProdutosNaTabela();
        await carregarProdutos();

        aviso.textContent = "Produto excluído com sucesso!";

    } catch (erro) {
        console.error("Erro ao excluir produto:", erro);
        aviso.textContent = erro.message;
    }
}


let estoqueCadastrado = [];

async function carregarEstoque() {
    const tbody = document.getElementById("lista-estoque");
    const aviso = document.getElementById("aviso-estoque");

    aviso.textContent = "Carregando estoque...";
    tbody.innerHTML = "";

    try {
        const resposta = await fetch("/estoque", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error("A API não retornou uma lista.");
        }

        estoqueCadastrado = dados;
        renderizarEstoque(dados);
        atualizarIndicadoresEstoque(dados);

        aviso.textContent = "";

    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
        aviso.textContent = "Não foi possível consultar o estoque.";
        tbody.innerHTML = "";

        document.getElementById("estoque-total-produtos").textContent = "—";
        document.getElementById("estoque-total-lotes").textContent = "—";
        document.getElementById("estoque-lotes-vencendo").textContent = "—";
    }
}

function renderizarEstoque(itens) {
    const tbody = document.getElementById("lista-estoque");
    tbody.innerHTML = "";

    if (itens.length === 0) {
        const linha = tbody.insertRow();
        const celula = linha.insertCell();
        celula.colSpan = 6;
        celula.textContent = "Nenhum lote registrado no estoque.";
        return;
    }

    itens.forEach(item => {
        const linha = tbody.insertRow();

        const valores = [
            item.produto,
            item.numeroRemessa,
            item.numeroLote,
            item.dataValidade,
            item.unidade,
            item.saldoAtual
        ];

        valores.forEach(valor => {
            const celula = linha.insertCell();
            celula.textContent = valor ?? "—";
        });
    });
}

function atualizarIndicadoresEstoque(itens) {
    const disponiveis = itens.filter(
        item => Number(item.saldoAtual) > 0
    );

    const produtos = new Set(
        disponiveis.map(item => item.produtoId)
    );

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + 30);

    const vencendo = disponiveis.filter(item => {
        if (!item.dataValidade) return false;

        const validade = new Date(item.dataValidade + "T00:00:00");

        return validade >= hoje && validade <= limite;
    });

    document.getElementById("estoque-total-produtos").textContent =
        produtos.size;

    document.getElementById("estoque-total-lotes").textContent =
        itens.length;

    document.getElementById("estoque-lotes-vencendo").textContent =
        vencendo.length;
}

document.getElementById("pesquisa-estoque")
    .addEventListener("input", function () {

        const termo = this.value.toLowerCase().trim();

        const filtrados = estoqueCadastrado.filter(item =>
            String(item.produto ?? "").toLowerCase().includes(termo) ||
            String(item.numeroRemessa ?? "").toLowerCase().includes(termo) ||
            String(item.numeroLote ?? "").toLowerCase().includes(termo)
        );

        renderizarEstoque(filtrados);
    });
