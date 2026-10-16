import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AlertMessage from "../components/AlertMessage";
import PrimaryButton from "../components/PrimaryButton";
import { codiguitos_api } from "../services/tcc.api";
import { buscarProdutos } from "../services/produtosService";
import { ThemeContext } from "../contexts/ThemeContext";
import { TotalVenda } from "../components/LinhaItemVenda";

const API_BASE_URL = "http://localhost:8000";

const estadoInicial = {
  idProprietario: "",
  idVendedor: "",
  formaPagamento: "",
  observacoes: "",
};

const opcoesFormaPagamento = ["Crédito", "Débito", "Pix", "Dinheiro"];

// ---------- Helpers para lidar com PascalCase / camelCase da API ----------
function getIdProduto(produto) {
  return produto?.Id ?? produto?.id ?? produto?.idProduto;
}

function getNomeProduto(produto) {
  return produto?.Nome ?? produto?.nome ?? "Produto sem nome";
}

function getPrecoProduto(produto) {
  return Number(
    produto?.Preco ??
      produto?.preco ??
      produto?.Valor ??
      produto?.valor ??
      produto?.PrecoVenda ??
      produto?.precoVenda ??
      0
  );
}

function getEstoqueProduto(produto) {
  return Number(
    produto?.Quantidade ??
      produto?.quantidade ??
      produto?.Estoque ??
      produto?.estoque ??
      produto?.QuantidadeEstoque ??
      produto?.quantidadeEstoque ??
      produto?.Qtd ??
      produto?.qtd ??
      0
  );
}

// Monta a URL da imagem do produto (aceita URL completa ou caminho relativo)
function getImagemProduto(produto) {
  const img =
    produto?.imagem ??
    produto?.Imagem ??
    produto?.imagemUrl ??
    produto?.ImagemUrl ??
    null;
  if (!img) return null;
  if (/^(https?:)?\/\//i.test(img) || img.startsWith("data:")) return img;
  return `${API_BASE_URL}${img.startsWith("/") ? img : `/${img}`}`;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ---------- Normaliza retorno: array direto ou { result: [...] } ----------
function normalizarLista(lista) {
  if (Array.isArray(lista)) return lista;
  if (Array.isArray(lista?.result)) return lista.result;
  if (Array.isArray(lista?.data)) return lista.data;
  return [];
}

// ---------- Usuário logado ----------
// Lê o usuário salvo no navegador após o login. Tenta objetos JSON salvos
// (usuario, user, ...) e, se não achar, decodifica o payload de um token JWT.
// Se o seu login guarda os dados em outra chave, ajuste as listas abaixo.
const CHAVES_USUARIO = ["usuario", "user", "usuarioLogado", "authUser", "auth"];
const CHAVES_TOKEN = ["token", "accessToken", "authToken", "jwt"];

function decodificarJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function lerUsuarioLogado() {
  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    for (const chave of CHAVES_USUARIO) {
      try {
        const bruto = storage.getItem(chave);
        if (!bruto) continue;
        const dados = JSON.parse(bruto);
        if (dados && typeof dados === "object") return dados.user ?? dados.usuario ?? dados;
      } catch {
        // ignora valores que não são JSON
      }
    }
  }

  for (const storage of storages) {
    for (const chave of CHAVES_TOKEN) {
      const token = storage.getItem(chave);
      if (token) {
        const payload = decodificarJwt(token.replace(/^Bearer\s+/i, ""));
        if (payload) return payload;
      }
    }
  }

  return null;
}

// Descobre qual proprietário da lista corresponde à conta logada
function encontrarProprietarioLogado(usuario, proprietarios) {
  if (!usuario || proprietarios.length === 0) return null;

  const idProp = usuario.idProprietario ?? usuario.IdProprietario;
  const email = String(usuario.email ?? usuario.Email ?? "").toLowerCase();
  const id =
    usuario.Id ?? usuario.id ?? usuario.sub ?? usuario.nameid ?? usuario.userId;

  return (
    (idProp != null &&
      proprietarios.find((p) => String(p.Id ?? p.id) === String(idProp))) ||
    (email &&
      proprietarios.find(
        (p) => String(p.Email ?? p.email ?? "").toLowerCase() === email
      )) ||
    (id != null &&
      proprietarios.find((p) => String(p.Id ?? p.id) === String(id))) ||
    null
  );
}

export default function CadastroVendas() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [form, setForm] = useState(estadoInicial);
  const [itens, setItens] = useState([]);

  const [produtos, setProdutos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);

  // Proprietário identificado a partir da conta logada
  const [idProprietarioLogado, setIdProprietarioLogado] = useState("");

  const [buscaProduto, setBuscaProduto] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);

  const [loading, setLoading] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [carregandoVendedores, setCarregandoVendedores] = useState(false);
  const [carregandoProprietarios, setCarregandoProprietarios] = useState(false);
  const [mensagem, setMensagem] = useState({ type: "", text: "" });

  // Guarda os dados do protótipo/comprovante da venda gerada
  const [prototipoVenda, setPrototipoVenda] = useState(null);

  // ---------- Buscar produtos do banco ----------
  async function carregarProdutos() {
    setCarregandoProdutos(true);
    try {
      const listaProdutos = await buscarProdutos();
      const produtosNormalizados = normalizarLista(listaProdutos);
      setProdutos(produtosNormalizados);
      return produtosNormalizados;
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setMensagem({
        type: "error",
        text: "Não foi possível carregar os produtos disponíveis.",
      });
      return [];
    } finally {
      setCarregandoProdutos(false);
    }
  }

  // ---------- Carregar produtos, vendedores e proprietários ----------
  useEffect(() => {
    async function carregarVendedores() {
      setCarregandoVendedores(true);
      try {
        const { data } = await codiguitos_api.get("/vendedores");
        setVendedores(normalizarLista(data));
      } catch (error) {
        console.error("Erro ao carregar vendedores:", error);
        setMensagem({
          type: "error",
          text: "Não foi possível carregar os vendedores.",
        });
      } finally {
        setCarregandoVendedores(false);
      }
    }

    async function carregarProprietarios() {
      setCarregandoProprietarios(true);
      try {
        const { data } = await codiguitos_api.get("/proprietarios");
        setProprietarios(normalizarLista(data));
      } catch (error) {
        console.error("Erro ao carregar proprietários:", error);
        setMensagem({
          type: "error",
          text: "Não foi possível carregar os proprietários.",
        });
      } finally {
        setCarregandoProprietarios(false);
      }
    }

    carregarProdutos();
    carregarVendedores();
    carregarProprietarios();
  }, []);

  // ---------- Preenche o proprietário com a conta logada ----------
  useEffect(() => {
    if (proprietarios.length === 0) return;

    const encontrado = encontrarProprietarioLogado(
      lerUsuarioLogado(),
      proprietarios
    );
    if (!encontrado) return;

    const id = String(encontrado.Id ?? encontrado.id);
    setIdProprietarioLogado(id);
    setForm((anterior) => ({ ...anterior, idProprietario: id }));
  }, [proprietarios]);

  // ---------- Campos do formulário ----------
  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  // ---------- Manipulação dos itens ----------
  function encontrarProduto(idProduto) {
    return produtos.find(
      (p) => Number(getIdProduto(p)) === Number(idProduto)
    );
  }

  function adicionarProduto(produto) {
    const id = getIdProduto(produto);
    const estoque = getEstoqueProduto(produto);

    if (estoque < 1) {
      setMensagem({
        type: "error",
        text: `O produto "${getNomeProduto(produto)}" está sem estoque.`,
      });
      return;
    }

    if (itens.some((item) => Number(item.idProduto) === Number(id))) {
      setMensagem({
        type: "error",
        text: "Esse produto já foi adicionado à venda.",
      });
      return;
    }

    const preco = getPrecoProduto(produto);

    setItens((anterior) => [
      ...anterior,
      {
        idProduto: String(id),
        quantidade: "1",
        valorUnitario: preco.toFixed(2),
        valorTotal: preco.toFixed(2),
      },
    ]);
    setBuscaProduto("");
    setMensagem({ type: "", text: "" });
  }

  function alterarQuantidade(index, valorDigitado) {
    setItens((anterior) =>
      anterior.map((item, i) => {
        if (i !== index) return item;

        // Permite apagar o campo enquanto o usuário digita
        if (valorDigitado === "") {
          return { ...item, quantidade: "", valorTotal: "0.00" };
        }

        const produto = encontrarProduto(item.idProduto);
        const estoque = produto ? getEstoqueProduto(produto) : 0;

        let qtd = Math.floor(Number(valorDigitado));
        if (Number.isNaN(qtd)) return item;
        if (qtd > estoque) qtd = estoque;
        if (qtd < 1) qtd = 1;

        return {
          ...item,
          quantidade: String(qtd),
          valorTotal: (Number(item.valorUnitario) * qtd).toFixed(2),
        };
      })
    );
  }

  // Se o campo ficar vazio ao sair, volta para 1
  function normalizarQuantidade(index) {
    setItens((anterior) =>
      anterior.map((item, i) => {
        if (i !== index || item.quantidade !== "") return item;
        return {
          ...item,
          quantidade: "1",
          valorTotal: Number(item.valorUnitario).toFixed(2),
        };
      })
    );
  }

  function removerItem(index) {
    setItens((anterior) => anterior.filter((_, i) => i !== index));
    setMensagem({ type: "", text: "" });
  }

  // ---------- Total geral ----------
  const totalGeral = itens.reduce(
    (acc, item) => acc + (Number(item.valorTotal) || 0),
    0
  );

  // ---------- Resultados da pesquisa de produtos ----------
  const idsNaVenda = new Set(itens.map((item) => Number(item.idProduto)));

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = buscaProduto.trim().toLowerCase();
    if (!termo) return true;
    const nome = getNomeProduto(produto).toLowerCase();
    const id = String(getIdProduto(produto));
    return nome.includes(termo) || id.includes(termo);
  });

  function aoPressionarTeclaNaBusca(event) {
    if (event.key === "Enter") {
      // Evita enviar o formulário; adiciona o primeiro resultado disponível
      event.preventDefault();
      const primeiro = produtosFiltrados.find(
        (p) =>
          !idsNaVenda.has(Number(getIdProduto(p))) &&
          getEstoqueProduto(p) > 0
      );
      if (primeiro) adicionarProduto(primeiro);
    }
    if (event.key === "Escape") setBuscaAberta(false);
  }

  // ---------- Submit ----------
  async function cadastrarVenda(event) {
    event.preventDefault();

    // Limpa o protótipo anterior antes de uma nova tentativa
    setPrototipoVenda(null);

    if (!form.idProprietario) {
      setMensagem({ type: "error", text: "Selecione um proprietário." });
      return;
    }

    if (!form.idVendedor) {
      setMensagem({ type: "error", text: "Selecione um vendedor." });
      return;
    }

    if (!form.formaPagamento) {
      setMensagem({
        type: "error",
        text: "Selecione uma forma de pagamento.",
      });
      return;
    }

    const itensValidos = itens.filter(
      (i) => i.idProduto && Number(i.quantidade) > 0
    );
    if (itensValidos.length === 0) {
      setMensagem({
        type: "error",
        text: "Adicione pelo menos um produto à venda.",
      });
      return;
    }

    // Valida estoque
    for (const item of itensValidos) {
      const produto = encontrarProduto(item.idProduto);
      const estoque = produto ? getEstoqueProduto(produto) : 0;

      if (Number(item.quantidade) > estoque) {
        setMensagem({
          type: "error",
          text: `A quantidade do produto "${getNomeProduto(
            produto
          )}" ultrapassa o estoque disponível (${estoque}).`,
        });
        return;
      }
    }

    setLoading(true);
    setMensagem({ type: "", text: "" });

    try {
      const dados = {
        idProprietario: Number(form.idProprietario),
        idVendedor: Number(form.idVendedor),
        formaPagamento: String(form.formaPagamento),
        observacoes: form.observacoes?.trim() || "",
        valorTotal: Number(totalGeral.toFixed(2)),
        itens: itensValidos.map((i) => ({
          idProduto: Number(i.idProduto),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.valorUnitario),
          valorTotal: Number(i.valorTotal),
        })),
      };

      const resposta = await codiguitos_api.post("/vendas", dados, {
        headers: { "Content-Type": "application/json" },
      });

      const data = resposta?.data || {};

      // Busca os nomes de proprietário/vendedor para o protótipo
      const proprietario = proprietarios.find(
        (p) => Number(p.Id ?? p.id) === Number(form.idProprietario)
      );
      const vendedor = vendedores.find(
        (v) => Number(v.Id ?? v.id) === Number(form.idVendedor)
      );

      // Monta o protótipo/comprovante da venda
      setPrototipoVenda({
        numero: data.numero ?? data.idVenda ?? data.id ?? null,
        dataEmissao: data.dataEmissao ?? new Date().toISOString(),
        proprietarioNome: proprietario?.Nome ?? proprietario?.nome ?? "—",
        vendedorNome: vendedor?.Nome ?? vendedor?.nome ?? "—",
        observacoes: dados.observacoes,
        valorTotal: Number(data.valorTotal ?? dados.valorTotal),
        itens: itensValidos.map((i) => {
          const produto = encontrarProduto(i.idProduto);
          return {
            nome: getNomeProduto(produto),
            quantidade: Number(i.quantidade),
            valorUnitario: Number(i.valorUnitario),
            valorTotal: Number(i.valorTotal),
          };
        }),
      });

      const mensagemBase = (
        data?.message || "Venda registrada com sucesso!"
      ).trim();

      setMensagem({
        type: "success",
        text: `${mensagemBase}${
          mensagemBase.endsWith(".") ? "" : "."
        } Protótipo gerado.`,
      });

      // Mantém o proprietário da conta logada preenchido
      setForm({ ...estadoInicial, idProprietario: idProprietarioLogado });
      setItens([]);
      setBuscaProduto("");

      // Atualiza o estoque exibido após a venda
      carregarProdutos();
    } catch (error) {
      console.error(error);
      setMensagem({
        type: "error",
        text: error?.response?.data?.message || "Erro ao registrar venda.",
      });
    } finally {
      setLoading(false);
    }
  }

  const proprietarioTravado = Boolean(idProprietarioLogado);

  // ---------- Render ----------
  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        {/* ---------- Cabeçalho ---------- */}
        <header style={styles.header}>
          <div>
            <h2
              style={{
                ...styles.title,
                ...(isDark ? styles.titleDark : {}),
              }}
            >
              Cadastro de Vendas
            </h2>
            <p
              style={{
                ...styles.subtitle,
                ...(isDark ? styles.subtitleDark : {}),
              }}
            >
              Registre novas vendas e acompanhe o faturamento.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.voltarButton,
              ...(isDark ? styles.voltarButtonDark : {}),
            }}
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </button>
        </header>

        <section style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>
          <AlertMessage
            type={mensagem.type}
            message={mensagem.text}
            dark={isDark}
          />

          <form onSubmit={cadastrarVenda} style={styles.form}>
            {/* ---------- Proprietário + Vendedor + Pagamento ---------- */}
            <div style={styles.row}>
              <SelectField
                label="Proprietário"
                name="idProprietario"
                value={form.idProprietario}
                onChange={atualizarCampo}
                disabled={carregandoProprietarios || proprietarioTravado}
                isDark={isDark}
                hint={
                  proprietarioTravado ? "Preenchido com a conta logada" : ""
                }
              >
                <option value="">
                  {carregandoProprietarios
                    ? "Carregando proprietários..."
                    : "Selecione um proprietário..."}
                </option>
                {proprietarios.map((proprietario) => {
                  const id = proprietario.Id ?? proprietario.id;
                  const nome =
                    proprietario.Nome ?? proprietario.nome ?? "Sem nome";
                  return (
                    <option key={id} value={id}>
                      {nome}
                    </option>
                  );
                })}
              </SelectField>

              <SelectField
                label="Vendedor"
                name="idVendedor"
                value={form.idVendedor}
                onChange={atualizarCampo}
                disabled={carregandoVendedores}
                isDark={isDark}
              >
                <option value="">
                  {carregandoVendedores
                    ? "Carregando vendedores..."
                    : "Selecione um vendedor..."}
                </option>
                {vendedores.map((vendedor) => {
                  const id = vendedor.Id ?? vendedor.id;
                  const nome = vendedor.Nome ?? vendedor.nome ?? "Sem nome";
                  return (
                    <option key={id} value={id}>
                      {nome}
                    </option>
                  );
                })}
              </SelectField>

              <SelectField
                label="Forma de Pagamento"
                name="formaPagamento"
                value={form.formaPagamento}
                onChange={atualizarCampo}
                isDark={isDark}
              >
                <option value="">Selecione a Forma de Pagamento</option>
                {opcoesFormaPagamento.map((forma) => (
                  <option key={forma} value={forma}>
                    {forma}
                  </option>
                ))}
              </SelectField>
            </div>

            {/* ---------- Produtos da venda ---------- */}
            <div style={styles.itemsSection}>
              <div style={styles.itemsHeader}>
                <h3
                  style={{
                    ...styles.itemsTitle,
                    ...(isDark ? styles.itemsTitleDark : {}),
                  }}
                >
                  Produtos da venda{" "}
                  {carregandoProdutos && (
                    <span
                      style={{
                        ...styles.loadingHint,
                        ...(isDark ? styles.loadingHintDark : {}),
                      }}
                    >
                      atualizando...
                    </span>
                  )}
                </h3>

                <button
                  type="button"
                  style={{
                    ...styles.refreshButton,
                    ...(isDark ? styles.refreshButtonDark : {}),
                  }}
                  onClick={carregarProdutos}
                  disabled={carregandoProdutos}
                  title="Atualizar lista de produtos"
                >
                  ↻
                </button>
              </div>

              {/* ---------- Pesquisa e adição de produto ---------- */}
              <div style={styles.searchContainer}>
                <div
                  style={{
                    ...styles.searchWrapper,
                    ...(isDark ? styles.searchWrapperDark : {}),
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      ...styles.searchIcon,
                      ...(isDark ? styles.searchIconDark : {}),
                    }}
                  >
                    search
                  </span>

                  <input
                    type="text"
                    value={buscaProduto}
                    onChange={(e) => {
                      setBuscaProduto(e.target.value);
                      setBuscaAberta(true);
                    }}
                    onFocus={() => setBuscaAberta(true)}
                    onBlur={() => setBuscaAberta(false)}
                    onKeyDown={aoPressionarTeclaNaBusca}
                    placeholder="Pesquisar produto por nome ou ID para adicionar..."
                    style={{
                      ...styles.searchInput,
                      ...(isDark ? styles.searchInputDark : {}),
                    }}
                  />

                  {buscaProduto && (
                    <button
                      type="button"
                      style={{
                        ...styles.searchClear,
                        ...(isDark ? styles.searchClearDark : {}),
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setBuscaProduto("")}
                      title="Limpar pesquisa"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {buscaAberta && (
                  <div
                    style={{
                      ...styles.resultsList,
                      ...(isDark ? styles.resultsListDark : {}),
                    }}
                    // Evita que o input perca o foco ao clicar na lista
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {produtosFiltrados.length === 0 ? (
                      <p
                        style={{
                          ...styles.resultsEmpty,
                          ...(isDark ? styles.resultsEmptyDark : {}),
                        }}
                      >
                        Nenhum produto encontrado.
                      </p>
                    ) : (
                      produtosFiltrados.map((produto) => {
                        const id = getIdProduto(produto);
                        const estoque = getEstoqueProduto(produto);
                        const jaAdicionado = idsNaVenda.has(Number(id));
                        const semEstoque = estoque < 1;
                        const indisponivel = jaAdicionado || semEstoque;

                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={indisponivel}
                            onClick={() => adicionarProduto(produto)}
                            style={{
                              ...styles.resultItem,
                              ...(isDark ? styles.resultItemDark : {}),
                              ...(indisponivel ? styles.resultItemDisabled : {}),
                            }}
                          >
                            <ProdutoImagem produto={produto} size={44} isDark={isDark} />

                            <div style={styles.resultInfo}>
                              <strong
                                style={{
                                  ...styles.resultName,
                                  ...(isDark ? styles.resultNameDark : {}),
                                }}
                              >
                                {getNomeProduto(produto)}
                              </strong>
                              <span
                                style={{
                                  ...styles.resultMeta,
                                  ...(isDark ? styles.resultMetaDark : {}),
                                }}
                              >
                                #{id} · {formatarMoeda(getPrecoProduto(produto))} ·{" "}
                                {semEstoque
                                  ? "Sem estoque"
                                  : `${estoque} em estoque`}
                              </span>
                            </div>

                            <span
                              style={{
                                ...styles.resultAction,
                                ...(isDark ? styles.resultActionDark : {}),
                              }}
                            >
                              {jaAdicionado
                                ? "Já adicionado"
                                : semEstoque
                                ? "Indisponível"
                                : "+ Adicionar"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* ---------- Itens adicionados ---------- */}
              {itens.length === 0 ? (
                <p
                  style={{
                    ...styles.itensVazio,
                    ...(isDark ? styles.itensVazioDark : {}),
                  }}
                >
                  Nenhum produto adicionado. Use a pesquisa acima para
                  encontrar e adicionar produtos à venda.
                </p>
              ) : (
                itens.map((item, index) => {
                  const produto = encontrarProduto(item.idProduto);
                  const estoque = produto ? getEstoqueProduto(produto) : 0;

                  return (
                    <div
                      key={item.idProduto}
                      style={{
                        ...styles.itemCard,
                        ...(isDark ? styles.itemCardDark : {}),
                      }}
                    >
                      <ProdutoImagem produto={produto} size={64} isDark={isDark} />

                      <div style={styles.itemInfo}>
                        <strong
                          style={{
                            ...styles.resultName,
                            ...(isDark ? styles.resultNameDark : {}),
                          }}
                        >
                          {getNomeProduto(produto)}
                        </strong>
                        <span
                          style={{
                            ...styles.resultMeta,
                            ...(isDark ? styles.resultMetaDark : {}),
                          }}
                        >
                          {formatarMoeda(item.valorUnitario)} por unidade ·{" "}
                          estoque: {estoque}
                        </span>
                      </div>

                      <div style={styles.itemQty}>
                        <label
                          style={{
                            ...styles.itemHeaderLabel,
                            ...(isDark ? styles.itemHeaderLabelDark : {}),
                          }}
                        >
                          Qtd
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={estoque}
                          value={item.quantidade}
                          onChange={(e) =>
                            alterarQuantidade(index, e.target.value)
                          }
                          onBlur={() => normalizarQuantidade(index)}
                          style={{
                            ...styles.qtyInput,
                            ...(isDark ? styles.qtyInputDark : {}),
                          }}
                        />
                      </div>

                      <div style={styles.itemTotal}>
                        <span
                          style={{
                            ...styles.itemHeaderLabel,
                            ...(isDark ? styles.itemHeaderLabelDark : {}),
                          }}
                        >
                          Total
                        </span>
                        <strong
                          style={{
                            ...styles.itemTotalValue,
                            ...(isDark ? styles.itemTotalValueDark : {}),
                          }}
                        >
                          {formatarMoeda(item.valorTotal)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => removerItem(index)}
                        title="Remover produto"
                        style={{
                          ...styles.removeButton,
                          ...(isDark ? styles.removeButtonDark : {}),
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}

              <TotalVenda totalGeral={totalGeral} isDark={isDark} />
            </div>

            {/* ---------- Observações ---------- */}
            <div style={styles.fieldFull}>
              <label
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                Observações
              </label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={atualizarCampo}
                placeholder="Observações adicionais sobre a venda (opcional)"
                style={{
                  ...styles.textarea,
                  ...(isDark ? styles.textareaDark : {}),
                }}
                rows="3"
              />
            </div>

            {/* ---------- Ações ---------- */}
            <div style={styles.actions}>
              <PrimaryButton dark={isDark} disabled={loading} type="submit">
                {loading ? "Registrando..." : "Registrar venda"}
              </PrimaryButton>
            </div>
          </form>

          {/* ---------- Protótipo da Venda ---------- */}
          {prototipoVenda && (
            <div
              style={{
                ...styles.prototipo,
                ...(isDark ? styles.prototipoDark : {}),
              }}
            >
              <div
                style={{
                  ...styles.prototipoHeader,
                  ...(isDark ? styles.prototipoHeaderDark : {}),
                }}
              >
                <div>
                  <h3
                    style={{
                      ...styles.prototipoTitle,
                      ...(isDark ? styles.prototipoTitleDark : {}),
                    }}
                  >
                    Protótipo da Venda
                  </h3>
                  {prototipoVenda.numero && (
                    <p
                      style={{
                        ...styles.prototipoNumero,
                        ...(isDark ? styles.prototipoNumeroDark : {}),
                      }}
                    >
                      Nº {prototipoVenda.numero}
                    </p>
                  )}
                </div>

                <span
                  style={{
                    ...styles.prototipoStatus,
                    ...(isDark ? styles.prototipoStatusDark : {}),
                  }}
                >
                  Registrada
                </span>
              </div>

              <div
                style={{
                  ...styles.prototipoLinha,
                  ...(isDark ? styles.prototipoLinhaDark : {}),
                }}
              >
                <span>Data de emissão</span>
                <strong>
                  {new Date(prototipoVenda.dataEmissao).toLocaleString("pt-BR")}
                </strong>
              </div>

              <div
                style={{
                  ...styles.prototipoLinha,
                  ...(isDark ? styles.prototipoLinhaDark : {}),
                }}
              >
                <span>Proprietário</span>
                <strong>{prototipoVenda.proprietarioNome}</strong>
              </div>

              <div
                style={{
                  ...styles.prototipoLinha,
                  ...(isDark ? styles.prototipoLinhaDark : {}),
                }}
              >
                <span>Vendedor</span>
                <strong>{prototipoVenda.vendedorNome}</strong>
              </div>

              {prototipoVenda.observacoes && (
                <div
                  style={{
                    ...styles.prototipoLinha,
                    ...(isDark ? styles.prototipoLinhaDark : {}),
                  }}
                >
                  <span>Observações</span>
                  <strong>{prototipoVenda.observacoes}</strong>
                </div>
              )}

              <div
                style={{
                  ...styles.prototipoItensTitulo,
                  ...(isDark ? styles.prototipoItensTituloDark : {}),
                }}
              >
                Itens da venda
              </div>

              {prototipoVenda.itens.map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.prototipoItem,
                    ...(isDark ? styles.prototipoItemDark : {}),
                  }}
                >
                  <div>
                    <strong>{item.nome}</strong>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {item.quantidade} × {formatarMoeda(item.valorUnitario)}
                    </div>
                  </div>
                  <strong>{formatarMoeda(item.valorTotal)}</strong>
                </div>
              ))}

              <div
                style={{
                  ...styles.prototipoTotal,
                  ...(isDark ? styles.prototipoTotalDark : {}),
                }}
              >
                <span>TOTAL</span>
                <strong>{formatarMoeda(prototipoVenda.valorTotal)}</strong>
              </div>

              <p
                style={{
                  ...styles.prototipoAviso,
                  ...(isDark ? styles.prototipoAvisoDark : {}),
                }}
              >
                Este é um protótipo/comprovante gerado automaticamente e não
                substitui documentos fiscais.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ---------- Imagem do produto (com fallback quando não há imagem ou falha) ----------
function ProdutoImagem({ produto, size, isDark }) {
  const [falhou, setFalhou] = useState(false);
  const url = getImagemProduto(produto);
  const caixa = {
    ...styles.imagemBox,
    ...(isDark ? styles.imagemBoxDark : {}),
    width: size,
    height: size,
  };

  if (!url || falhou) {
    return (
      <div style={caixa} aria-hidden="true">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: Math.round(size * 0.5) }}
        >
          inventory_2
        </span>
      </div>
    );
  }

  return (
    <div style={caixa}>
      <img
        src={url}
        alt={getNomeProduto(produto)}
        onError={() => setFalhou(true)}
        style={styles.imagem}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  disabled,
  isDark,
  hint,
  children,
}) {
  return (
    <div style={styles.field}>
      <label
        style={{
          ...styles.label,
          ...(isDark ? styles.labelDark : {}),
        }}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          ...styles.select,
          ...(isDark ? styles.selectDark : {}),
        }}
        disabled={disabled}
      >
        {children}
      </select>
      {hint && (
        <span
          style={{
            ...styles.hint,
            ...(isDark ? styles.hintDark : {}),
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#f3f5f9" },
  layoutDark: { backgroundColor: "#0f172a" },
  page: {
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  },
  pageDark: { backgroundColor: "#111827", color: "#f3f4f6" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    gap: "16px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111c2d",
    fontWeight: 700,
    fontFamily: "Montserrat, sans-serif",
  },
  titleDark: { color: "#f9fafb" },
  subtitle: { margin: "8px 0 0", color: "#4a5568" },
  subtitleDark: { color: "#d1d5db" },

  voltarButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#f9f9ff",
    color: "#303e51",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    flexShrink: 0,
  },
  voltarButtonDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    maxWidth: "900px",
  },
  cardDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },

  row: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  field: { display: "flex", flexDirection: "column", gap: "8px" },
  fieldFull: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: { fontWeight: 600, color: "#303e51" },
  labelDark: { color: "#e5e7eb" },
  hint: { fontSize: "12px", color: "#64748b" },
  hintDark: { color: "#94a3b8" },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
  },
  selectDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
    resize: "vertical",
  },
  textareaDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  actions: { display: "flex", justifyContent: "flex-end" },

  itemsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemsTitle: { margin: 0, fontSize: "16px", color: "#111c2d" },
  itemsTitleDark: { color: "#f9fafb" },
  loadingHint: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 400,
    marginLeft: "8px",
  },
  loadingHintDark: { color: "#94a3b8" },
  refreshButton: {
    border: "1px solid #cbd5e1",
    backgroundColor: "#fff",
    color: "#303e51",
    padding: "8px 12px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  },
  refreshButtonDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },

  // ---------- Pesquisa de produtos ----------
  searchContainer: { position: "relative" },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },
  searchWrapperDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
  },
  searchIcon: {
    fontSize: "20px",
    color: "#64748b",
    flexShrink: 0,
  },
  searchIconDark: { color: "#94a3b8" },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 0",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
  },
  searchInputDark: { color: "#f9fafb" },
  searchClear: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "14px",
    padding: "4px 6px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  searchClearDark: { color: "#cbd5e1" },

  resultsList: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    zIndex: 20,
    maxHeight: "320px",
    overflowY: "auto",
    padding: "6px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  },
  resultsListDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
  },
  resultsEmpty: {
    margin: 0,
    padding: "14px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },
  resultsEmptyDark: { color: "#94a3b8" },
  resultItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },
  resultItemDark: { color: "#f9fafb" },
  resultItemDisabled: { opacity: 0.5, cursor: "not-allowed" },
  resultInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  resultName: {
    fontSize: "14px",
    color: "#111c2d",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  resultNameDark: { color: "#f9fafb" },
  resultMeta: { fontSize: "12px", color: "#64748b" },
  resultMetaDark: { color: "#94a3b8" },
  resultAction: {
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: 600,
    color: "#A41623",
  },
  resultActionDark: { color: "#fca5a5" },

  // ---------- Imagem do produto ----------
  imagemBox: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  imagemBoxDark: {
    backgroundColor: "#0b1220",
    borderColor: "#334155",
    color: "#64748b",
  },
  imagem: { width: "100%", height: "100%", objectFit: "cover" },

  // ---------- Itens adicionados ----------
  itensVazio: {
    margin: 0,
    padding: "18px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    borderRadius: "10px",
  },
  itensVazioDark: { color: "#94a3b8", borderColor: "#4b5563" },
  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "10px",
    backgroundColor: "#f8fafc",
  },
  itemCardDark: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  itemQty: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "80px",
  },
  qtyInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
  },
  qtyInputDark: {
    backgroundColor: "#111827",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  itemTotal: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "110px",
  },
  itemTotalValue: { fontSize: "15px", color: "#111c2d" },
  itemTotalValueDark: { color: "#f9fafb" },
  itemHeaderLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#64748b",
  },
  itemHeaderLabelDark: { color: "#94a3b8" },
  removeButton: {
    border: "1px solid #fecaca",
    backgroundColor: "#fff",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    flexShrink: 0,
  },
  removeButtonDark: {
    backgroundColor: "#3f1721",
    borderColor: "#7f1d1d",
    color: "#fecdd3",
  },

  // ---------- Protótipo da Venda ----------
  prototipo: {
    marginTop: "32px",
    padding: "24px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
  },
  prototipoDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
  },
  prototipoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  prototipoHeaderDark: {
    borderBottomColor: "#4b5563",
  },
  prototipoTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#111c2d",
  },
  prototipoTitleDark: { color: "#f9fafb" },
  prototipoNumero: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  prototipoNumeroDark: { color: "#cbd5e1" },
  prototipoStatus: {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: "13px",
    fontWeight: 600,
  },
  prototipoStatusDark: {
    backgroundColor: "#064e3b",
    color: "#d1fae5",
  },
  prototipoLinha: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
  },
  prototipoLinhaDark: {
    borderBottomColor: "#4b5563",
    color: "#e5e7eb",
  },
  prototipoItensTitulo: {
    marginTop: "18px",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#64748b",
  },
  prototipoItensTituloDark: { color: "#94a3b8" },
  prototipoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    marginBottom: "8px",
    color: "#111c2d",
  },
  prototipoItemDark: {
    backgroundColor: "#0b1220",
    borderColor: "#334155",
    color: "#f9fafb",
  },
  prototipoTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "2px solid #e2e8f0",
    fontSize: "20px",
    color: "#111c2d",
  },
  prototipoTotalDark: {
    borderTopColor: "#4b5563",
    color: "#f9fafb",
  },
  prototipoAviso: {
    margin: "20px 0 0",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fff7ed",
    color: "#9a3412",
    fontSize: "13px",
    textAlign: "center",
  },
  prototipoAvisoDark: {
    backgroundColor: "#3f2715",
    color: "#fed7aa",
  },
};