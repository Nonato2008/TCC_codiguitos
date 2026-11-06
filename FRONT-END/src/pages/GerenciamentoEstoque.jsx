import { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { useFornecedores } from "../hooks/useFornecedores";
import { ajustarQuantidadeEstoque } from "../services/produtosService";
import { formatErrorMessage } from "../utils/formatErrorMessage";
import { ThemeContext } from "../contexts/ThemeContext";

const CHAVE_PRODUTOS_DESATIVADOS = "produtosDesativados";

function lerProdutosDesativados() {
  try {
    const ids = JSON.parse(
      localStorage.getItem(CHAVE_PRODUTOS_DESATIVADOS) || "[]"
    );

    return Array.isArray(ids) ? ids.map(String) : [];
  } catch (error) {
    console.error("Erro ao carregar produtos desativados:", error);
    return [];
  }
}

// Monta a URL correta da imagem do produto
// Aceita URL absoluta, caminho com/sem barra, ou retorna placeholder
function getImagemProduto(imagem) {
  if (!imagem) {
    return "/example.jpg";
  }

  if (/^https?:\/\//i.test(imagem)) {
    return imagem;
  }

  const caminho = imagem.startsWith("/") ? imagem : `/${imagem}`;

  return `http://localhost:8000${caminho}`;
}

// Verifica se o produto está vencido com base na data de vencimento
function getStatusValidade(produto) {
  const dataVencimento = produto?.DataVenc ?? produto?.dataVenc ?? produto?.data_venc;

  if (!dataVencimento) {
    return { texto: "Na validade", tipo: "valid" };
  }

  const textoData = String(dataVencimento).trim();
  const data = /^\d{4}-\d{2}-\d{2}$/.test(textoData)
    ? new Date(
        Number(textoData.slice(0, 4)),
        Number(textoData.slice(5, 7)) - 1,
        Number(textoData.slice(8, 10))
      )
    : new Date(textoData);
  if (Number.isNaN(data.getTime())) {
    return { texto: "Na validade", tipo: "valid" };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return data < hoje
    ? { texto: "Vencido", tipo: "expired" }
    : { texto: "Na validade", tipo: "valid" };
}

export default function GerenciamentoEstoque() {

  // Hooks que carregam produtos e fornecedores da API
  const { produtos, loading, error } = useProdutos();
  const { fornecedores } = useFornecedores();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Mantém a lista local sincronizada com os ajustes confirmados.
  const [listaProdutos, setListaProdutos] = useState([]);
  const [produtosSalvando, setProdutosSalvando] = useState([]);
  const [idsProdutosDesativados, setIdsProdutosDesativados] = useState(
    lerProdutosDesativados
  );
  const [abaProdutos, setAbaProdutos] = useState("ativos");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroFornecedor, setFiltroFornecedor] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [filtroValidade, setFiltroValidade] = useState("todos");

  // Descobre o nome do fornecedor a partir do id do produto
  const getFornecedorNome = (produto) => {
    const idFornecedor = Number(produto.IdFornecedor ?? produto.idFornecedor ?? 0);
    const fornecedor = (fornecedores || []).find(
      (item) => Number(item.Id ?? item.id ?? 0) === idFornecedor
    );

    return fornecedor?.Nome ?? fornecedor?.nome ?? "Fornecedor não informado";
  };

  // Normaliza os produtos vindos do hook para o formato usado na tela.
  useEffect(() => {
    setListaProdutos(
      (produtos || []).map((produto, index) => {
        const imagemOriginal = getImagemProduto(produto.Imagem ?? produto.imagem ?? "/example.jpg");
        const quantidadeAtual = Number(produto.Quantidade ?? produto.quantidade ?? 0);

        return {
          ...produto,
          id:
            produto.Id ??
            produto.id ??
            produto._id ??
            produto.idProduto ??
            `${produto.Nome ?? produto.nome ?? "produto"}-${index}`,
          nome: produto.Nome ?? produto.nome ?? `Produto ${index + 1}`,
          quantidade: quantidadeAtual,
          quantidadeAjuste: "",
          operacaoEstoque: "entrada",
          imagemOriginal,
          imagem: quantidadeAtual === 0 ? "esgotado.jpg" : imagemOriginal,
        };
      })
    );
  }, [produtos]);

  // Mantém a quantidade digitada sem arredondar valores inválidos em silêncio.
  function atualizarQuantidadeEntrada(event, idProduto) {
    const valorDigitado = event.target.value;

    setListaProdutos((atual) =>
      atual.map((produto) =>
        produto.id === idProduto
          ? { ...produto, quantidadeAjuste: valorDigitado }
          : produto
      )
    );
  }

  function selecionarOperacaoEstoque(idProduto, operacaoEstoque) {
    setListaProdutos((atual) =>
      atual.map((produto) =>
        produto.id === idProduto
          ? { ...produto, operacaoEstoque }
          : produto
      )
    );
  }

  async function confirmarOperacaoEstoque(event, idProduto) {
    event.preventDefault();

    const produtoAtual = listaProdutos.find((produto) => produto.id === idProduto);
    const ajuste = Number(produtoAtual?.quantidadeAjuste);

    if (
      !produtoAtual ||
      !Number.isInteger(ajuste) ||
      ajuste <= 0 ||
      produtosSalvando.includes(idProduto)
    ) {
      return;
    }

    const novaQuantidade =
      produtoAtual.operacaoEstoque === "entrada"
        ? produtoAtual.quantidade + ajuste
        : produtoAtual.quantidade - ajuste;

    if (novaQuantidade < 0) {
      alert("A retirada não pode ser maior que o estoque disponível.");
      return;
    }

    if (novaQuantidade > 999999) {
      alert("A quantidade em estoque não pode ultrapassar 999.999 unidades.");
      return;
    }

    setProdutosSalvando((atual) => [...atual, idProduto]);

    try {
      const resultado = await ajustarQuantidadeEstoque(idProduto, {
        operacao: produtoAtual.operacaoEstoque,
        quantidade: ajuste,
      });

      setListaProdutos((atual) =>
        atual.map((produto) =>
          produto.id === idProduto
            ? {
                ...produto,
                quantidade: resultado.quantidade,
                quantidadeAjuste: "",
                Status: resultado.status,
                imagem:
                  resultado.quantidade === 0
                    ? "esgotado.jpg"
                    : produto.imagemOriginal ?? produto.imagem,
              }
            : produto
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        formatErrorMessage(
          err,
          "Falha ao atualizar o estoque no banco de dados."
        )
      );
    } finally {
      setProdutosSalvando((atual) =>
        atual.filter((id) => id !== idProduto)
      );
    }
  }

  function alternarDisponibilidade(idProduto, ativo) {
    const idsAtualizados = ativo
      ? idsProdutosDesativados.filter((id) => id !== String(idProduto))
      : [...new Set([...idsProdutosDesativados, String(idProduto)])];

    try {
      localStorage.setItem(
        CHAVE_PRODUTOS_DESATIVADOS,
        JSON.stringify(idsAtualizados)
      );
      setIdsProdutosDesativados(idsAtualizados);
    } catch (error) {
      console.error("Erro ao alterar status do produto:", error);
      alert("Não foi possível atualizar o status do produto neste navegador.");
    }
  }

  const produtosFiltrados = listaProdutos.filter((produto) =>
    {
      const produtoAtivo = !idsProdutosDesativados.includes(String(produto.id));
      const termoNome = filtroNome.trim().toLocaleLowerCase("pt-BR");
      const nomeProduto = String(produto.nome ?? "").toLocaleLowerCase("pt-BR");
      const idFornecedor = String(
        produto.IdFornecedor ?? produto.idFornecedor ?? produto.id_fornecedor ?? ""
      );
      const quantidadeMinimaNumero =
        quantidadeMinima === "" ? null : Number(quantidadeMinima);
      const validade = getStatusValidade(produto);

      if (abaProdutos === "ativos" ? !produtoAtivo : produtoAtivo) return false;
      if (termoNome && !nomeProduto.includes(termoNome)) return false;
      if (filtroFornecedor && idFornecedor !== filtroFornecedor) return false;
      if (
        quantidadeMinimaNumero !== null &&
        produto.quantidade < quantidadeMinimaNumero
      ) {
        return false;
      }
      if (filtroValidade === "vencidos" && validade.tipo !== "expired") {
        return false;
      }
      if (filtroValidade === "validos" && validade.tipo !== "valid") {
        return false;
      }

      return true;
    }
  );

  const totalProdutosAtivos = listaProdutos.filter(
    (produto) => !idsProdutosDesativados.includes(String(produto.id))
  ).length;

  const totalProdutosDesativados = listaProdutos.length - totalProdutosAtivos;
  const filtrosAtivos =
    filtroNome ||
    filtroFornecedor ||
    quantidadeMinima !== "" ||
    filtroValidade !== "todos";

  function limparFiltros() {
    setFiltroNome("");
    setFiltroFornecedor("");
    setQuantidadeMinima("");
    setFiltroValidade("todos");
  }

  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        <header style={styles.header}>
          <div>
            <h2 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>Gerenciamento de Estoque</h2>
            <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
              Ajuste o estoque dos produtos cadastrados e controle a disponibilidade para venda.
            </p>
          </div>
        </header>

        {!loading && !error && listaProdutos.length > 0 && (
          <div
            style={styles.tabs}
            role="group"
            aria-label="Filtrar produtos por status"
          >
            <button
              type="button"
              aria-pressed={abaProdutos === "ativos"}
              onClick={() => setAbaProdutos("ativos")}
              style={{
                ...styles.tabButton,
                ...(isDark ? styles.tabButtonDark : {}),
                ...(abaProdutos === "ativos"
                  ? styles.tabButtonActive
                  : {
                      color: isDark ? "#ffffff" : "#64748b",
                      borderBottomColor: "transparent",
                    }),
                ...(isDark && abaProdutos === "ativos" ? styles.tabButtonActiveDark : {}),
              }}
            >
              Ativos ({totalProdutosAtivos})
            </button>
            <button
              type="button"
              aria-pressed={abaProdutos === "desativados"}
              onClick={() => setAbaProdutos("desativados")}
              style={{
                ...styles.tabButton,
                ...(isDark ? styles.tabButtonDark : {}),
                ...(abaProdutos === "desativados"
                  ? styles.tabButtonActive
                  : {
                      color: isDark ? "#ffffff" : "#64748b",
                      borderBottomColor: "transparent",
                    }),
                ...(isDark && abaProdutos === "desativados" ? styles.tabButtonActiveDark : {}),
              }}
            >
              Desativados ({totalProdutosDesativados})
            </button>
          </div>
        )}

        {!loading && !error && listaProdutos.length > 0 && (
          <section
            style={{
              ...styles.filtersCard,
              ...(isDark ? styles.filtersCardDark : {}),
            }}
            aria-label="Filtros de estoque"
          >
            <div style={styles.filtersHeader}>
              <div>
                <h3 style={{ ...styles.filtersTitle, ...(isDark ? styles.filtersTitleDark : {}) }}>
                  Pesquisar e filtrar
                </h3>
                <p style={{ ...styles.filtersDescription, ...(isDark ? styles.filtersDescriptionDark : {}) }}>
                  Filtre os produtos por nome, fornecedor, quantidade e validade.
                </p>
              </div>
              {filtrosAtivos && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  style={{
                    ...styles.clearFiltersButton,
                    ...(isDark ? styles.clearFiltersButtonDark : {}),
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div style={styles.filtersGrid}>
              <label style={{ ...styles.filterField, ...(isDark ? styles.filterFieldDark : {}) }}>
                <span>Nome do produto</span>
                <input
                  type="search"
                  value={filtroNome}
                  onChange={(event) => setFiltroNome(event.target.value)}
                  placeholder="Pesquisar por nome"
                  style={{ ...styles.filterInput, ...(isDark ? styles.filterInputDark : {}) }}
                />
              </label>

              <label style={{ ...styles.filterField, ...(isDark ? styles.filterFieldDark : {}) }}>
                <span>Fornecedor</span>
                <select
                  value={filtroFornecedor}
                  onChange={(event) => setFiltroFornecedor(event.target.value)}
                  style={{ ...styles.filterInput, ...(isDark ? styles.filterInputDark : {}) }}
                >
                  <option value="">Todos os fornecedores</option>
                  {(fornecedores || []).map((fornecedor, index) => {
                    const id = fornecedor.Id ?? fornecedor.id ?? fornecedor.idFornecedor ?? fornecedor.IdFornecedor;
                    const nome = fornecedor.Nome ?? fornecedor.nome;
                    if (id === undefined || id === null || !nome) return null;

                    return (
                      <option key={`${id}-${index}`} value={String(id)}>
                        {nome}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label style={{ ...styles.filterField, ...(isDark ? styles.filterFieldDark : {}) }}>
                <span>Quantidade mínima</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantidadeMinima}
                  onChange={(event) => setQuantidadeMinima(event.target.value)}
                  placeholder="Sem mínimo"
                  style={{ ...styles.filterInput, ...(isDark ? styles.filterInputDark : {}) }}
                />
              </label>

              <label style={{ ...styles.filterField, ...(isDark ? styles.filterFieldDark : {}) }}>
                <span>Validade</span>
                <select
                  value={filtroValidade}
                  onChange={(event) => setFiltroValidade(event.target.value)}
                  style={{ ...styles.filterInput, ...(isDark ? styles.filterInputDark : {}) }}
                >
                  <option value="todos">Todos</option>
                  <option value="validos">Na validade</option>
                  <option value="vencidos">Vencidos</option>
                </select>
              </label>
            </div>
          </section>
        )}

        {loading && <div style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>Carregando produtos...</div>}

        {!loading && error && <div style={{ ...styles.emptyStateError, ...(isDark ? styles.emptyStateErrorDark : {}) }}>{error}</div>}

        {!loading && !error && listaProdutos.length === 0 && (
          <div style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>Nenhum produto cadastrado.</div>
        )}

        {!loading && !error && listaProdutos.length > 0 && produtosFiltrados.length === 0 && (
          <div style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>
            Nenhum produto {abaProdutos === "ativos" ? "ativo" : "desativado"} corresponde aos filtros.
          </div>
        )}

        {!loading && !error && produtosFiltrados.length > 0 && (
          <div style={styles.listContainer}>
            {produtosFiltrados.map((produto) => {
              const validade = getStatusValidade(produto);
              const produtoAtivo = !idsProdutosDesativados.includes(
                String(produto.id)
              );
              const quantidadeAjuste = Number(produto.quantidadeAjuste);
              const quantidadePrevista =
                produto.operacaoEstoque === "entrada"
                  ? produto.quantidade + quantidadeAjuste
                  : produto.quantidade - quantidadeAjuste;
              const ajusteValido =
                Number.isInteger(quantidadeAjuste) &&
                quantidadeAjuste > 0 &&
                quantidadePrevista >= 0 &&
                quantidadePrevista <= 999999;
              const salvando = produtosSalvando.includes(produto.id);

              return (
                <section key={String(produto.id)} style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>
                  <div style={styles.productContent}>
                    <div style={styles.imageBox}>
                      <img src={produto.imagem} alt={produto.nome} style={styles.productImage} />
                    </div>

                    <div style={styles.infoArea}>
                      <div style={styles.badgeRow}>
                        <span style={{ ...styles.badge, ...(isDark ? styles.badgeDark : {}) }}>{produto.categoria || "Produto"}</span>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(produtoAtivo ? styles.statusAtivo : styles.statusInativo),
                            ...(isDark ? styles.statusBadgeDark : {}),
                          }}
                        >
                          {produtoAtivo ? "Produto ativo" : "Produto desativado"}
                        </span>
                        <span
                          style={{
                            ...styles.validadeBadge,
                            ...(validade.tipo === "expired" ? styles.validadeBadgeVencido : styles.validadeBadgeValido),
                            ...(isDark ? styles.validadeBadgeDark : {}),
                          }}
                        >
                          {validade.texto}
                        </span>
                      </div>

                      <h3 style={{ ...styles.productName, ...(isDark ? styles.productNameDark : {}) }}>{produto.nome}</h3>
                      <div style={{ ...styles.fornecedorName, ...(isDark ? styles.fornecedorNameDark : {}) }}>{getFornecedorNome(produto)}</div>

                      <div style={styles.stockSummary}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>Estoque atual</span>
                        <strong style={{ ...styles.stockValue, ...(isDark ? styles.stockValueDark : {}) }}>{produto.quantidade} unidades</strong>
                      </div>

                      <div style={styles.priceSummary}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>Preço unitário</span>
                        <strong style={{ ...styles.priceValue, ...(isDark ? styles.priceValueDark : {}) }}>
                          {Number(produto.Preco ?? produto.preco ?? 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </strong>
                      </div>

                      <div style={styles.vencimentoSummary}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>Data de vencimento</span>
                        <strong style={{ ...styles.vencimentoValue, ...(isDark ? styles.vencimentoValueDark : {}) }}>
                          {produto.DataVenc || produto.dataVenc
                            ? new Date(produto.DataVenc ?? produto.dataVenc).toLocaleDateString("pt-BR")
                            : "-"}
                        </strong>
                      </div>

                      <form
                        style={{
                          ...styles.stockAdjustment,
                          ...(isDark ? styles.stockAdjustmentDark : {}),
                        }}
                        onSubmit={(event) =>
                          confirmarOperacaoEstoque(event, produto.id)
                        }
                      >
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                          Ajustar quantidade
                        </span>

                        <div style={styles.operationButtons}>
                          <button
                            type="button"
                            aria-pressed={produto.operacaoEstoque === "entrada"}
                            onClick={() =>
                              selecionarOperacaoEstoque(produto.id, "entrada")
                            }
                            style={{
                              ...styles.operationButton,
                              ...(isDark ? styles.operationButtonDark : {}),
                              ...(produto.operacaoEstoque === "entrada"
                                ? styles.operationButtonActive
                                : {}),
                            }}
                          >
                            + Adicionar
                          </button>

                          <button
                            type="button"
                            aria-pressed={produto.operacaoEstoque === "saida"}
                            onClick={() =>
                              selecionarOperacaoEstoque(produto.id, "saida")
                            }
                            style={{
                              ...styles.operationButton,
                              ...(isDark ? styles.operationButtonDark : {}),
                              ...(produto.operacaoEstoque === "saida"
                                ? styles.operationButtonRemoveActive
                                : {}),
                            }}
                          >
                            − Retirar
                          </button>
                        </div>

                        <label
                          htmlFor={`ajuste-estoque-${produto.id}`}
                          style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}
                        >
                          Unidades
                        </label>
                        <input
                          id={`ajuste-estoque-${produto.id}`}
                          type="number"
                          min="1"
                          max="999999"
                          step="1"
                          required
                          value={produto.quantidadeAjuste}
                          onChange={(event) =>
                            atualizarQuantidadeEntrada(event, produto.id)
                          }
                          style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                        />

                        {Number.isInteger(quantidadeAjuste) &&
                          quantidadeAjuste > 0 && (
                            <span
                              style={{
                                ...styles.stockPreview,
                                ...(isDark ? styles.stockPreviewDark : {}),
                                ...(quantidadePrevista < 0 ||
                                quantidadePrevista > 999999
                                  ? isDark
                                    ? styles.stockPreviewErrorDark
                                    : styles.stockPreviewError
                                  : {}),
                              }}
                            >
                              {quantidadePrevista < 0
                                ? "A retirada excede o estoque disponível."
                                : quantidadePrevista > 999999
                                  ? "O estoque não pode ultrapassar 999.999 unidades."
                                  : `Estoque após a operação: ${quantidadePrevista} unidades`}
                            </span>
                          )}

                        <button
                          type="submit"
                          disabled={!ajusteValido || salvando}
                          style={{
                            ...styles.confirmButton,
                            ...(isDark ? styles.confirmButtonDark : {}),
                            ...((!ajusteValido || salvando)
                              ? styles.confirmButtonDisabled
                              : {}),
                          }}
                        >
                          {salvando
                            ? "Salvando..."
                            : "Confirmar operação"}
                        </button>
                      </form>

                      <button
                        type="button"
                        onClick={() =>
                          alternarDisponibilidade(produto.id, !produtoAtivo)
                        }
                        style={{ ...styles.toggleButton, ...(isDark ? styles.toggleButtonDark : {}) }}
                      >
                        {produtoAtivo ? "Desativar" : "Reativar"}
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { 
    display: "flex", 
    minHeight: "100vh", 
    backgroundColor: "var(--surface)"
  },

  layoutDark: { 
    backgroundColor: "var(--app-background)"
  },

  page: { 
    marginLeft: "256px", 
    width: "calc(100% - 256px)", 
    padding: "32px", 
    boxSizing: "border-box" 
  },

  pageDark: { 
    backgroundColor: "var(--surface)",
    color: "#f3f4f6" 
  },

  header: {
     marginBottom: "24px" 
    },

  title: { 
    margin: 0, 
    fontSize: "32px", 
    color: "#111c2d", 
    fontWeight: 700 
  },

  titleDark: { 
    color: "#f9fafb" 
  },

  subtitle: { 
    margin: "8px 0 0", 
    color: "#4a5568" 
  },

  subtitleDark: { 
    color: "#d1d5db" 
  },

  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    borderBottom: "1px solid var(--border-color)",
  },

  tabButton: {
    border: "none",
    borderBottom: "2px solid transparent",
    backgroundColor: "transparent",
    color: "#64748b",
    padding: "10px 12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  tabButtonDark: {
    color: "#ffffff",
  },

  tabButtonActive: {
    color: "var(--accent-color)",
    borderBottomColor: "var(--accent-color)",
  },

  tabButtonActiveDark: {
    color: "#ffffff",
    borderBottomColor: "#ffffff",
  },

  filtersCard: {
    marginBottom: "20px",
    padding: "18px 20px",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    boxSizing: "border-box",
  },

  filtersCardDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
  },

  filtersHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  },

  filtersTitle: {
    margin: 0,
    color: "#243447",
    fontSize: "16px",
    fontWeight: 700,
  },

  filtersTitleDark: {
    color: "#f9fafb",
  },

  filtersDescription: {
    margin: "4px 0 0",
    color: "#718096",
    fontSize: "13px",
  },

  filtersDescriptionDark: {
    color: "#cbd5e1",
  },

  clearFiltersButton: {
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    padding: "9px 10px",
    backgroundColor: "var(--surface)",
    color: "#243447",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },

  clearFiltersButtonDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },

  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
    minWidth: 0,
  },

  filterFieldDark: {
    color: "#e5e7eb",
  },

  filterInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    padding: "10px 12px",
    backgroundColor: "var(--surface)",
    color: "#243447",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
  },

  filterInputDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  emptyState: { 
    backgroundColor: "var(--surface)",
    color: "#475569", 
    borderRadius: "10px", 
    padding: "18px", 
    border: "1px solid var(--border-color)"
  },

  emptyStateDark: { 
    backgroundColor: "var(--surface)",
    color: "#e5e7eb", 
    borderColor: "var(--border-color)"
  },

  emptyStateError: { 
    backgroundColor: "#fee2e2", 
    color: "#991b1b", 
    borderRadius: "10px", 
    padding: "18px", 
    border: "1px solid #fecaca" 
  },

  emptyStateErrorDark: { 
    backgroundColor: "#3f1721", 
    color: "#fecdd3", 
    borderColor: "#7f1d1d" 
  },

  listContainer: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", 
    gap: "20px" 
  },

  card: { 
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px", 
    padding: "18px", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
  },

  cardDark: { 
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)"
  },

  productContent: { 
    display: "flex", 
    gap: "16px" 
  },

  imageBox: { 
    width: "120px", 
    height: "120px", 
    borderRadius: "10px", 
    overflow: "hidden", 
    backgroundColor: "var(--surface)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    flexShrink: 0 
  },

  productImage: { 
    width: "100%", 
    height: "100%", 
    objectFit: "contain", 
    objectPosition: "center" 
  },

  infoArea: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: "10px" 
  },

  badgeRow: { 
    display: "flex", 
    flexWrap: "wrap", 
    gap: "8px", 
    alignItems: "center" 
  },

  badge: { 
    backgroundColor: "#e2e8f0", 
    color: "#0f172a", 
    borderRadius: "999px", 
    padding: "4px 8px", 
    fontSize: "12px" 
  },

  badgeDark: { 
    backgroundColor: "#334155", 
    color: "#e2e8f0" 
  },

  statusBadge: { 
    borderRadius: "999px", 
    padding: "4px 8px", 
    fontSize: "12px", 
    fontWeight: 600 
  },

  statusBadgeDark: { 
    opacity: 1 
  },

  statusAtivo: { 
    backgroundColor: "#dcfce7", 
    color: "#166534" 
  },

  statusInativo: { 
    backgroundColor: "#fee2e2", 
    color: "#991b1b" 
  },

  validadeBadge: { 
    borderRadius: "999px", 
    padding: "4px 8px", 
    fontSize: "12px", 
    fontWeight: 600 
  },

  validadeBadgeDark: { 
    opacity: 1 
  },

  validadeBadgeValido: { 
    backgroundColor: "#e0f2fe", 
    color: "#075985" 
  },

  validadeBadgeVencido: { 
    backgroundColor: "#fef3c7", 
    color: "#92400e" 
  },

  productName: { 
    margin: 0, 
    color: "#111c2d", 
    fontSize: "20px" 
  },

  productNameDark: { 
    color: "#f9fafb" 
  },

  fornecedorName: { 
    color: "#64748b", 
    fontSize: "13px" 
  },

  fornecedorNameDark: { 
    color: "#d1d5db" 
  },

  stockSummary: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: "8px", 
    padding: "8px 0" 
  },

  label: { 
    color: "#475569", 
    fontSize: "12px" 
  },

  labelDark: { 
    color: "#d1d5db" 
  },

  stockValue: { 
    color: "#111827", 
    fontSize: "16px" 
  },

  stockValueDark: { 
    color: "#f9fafb" 
  },

  priceSummary: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    gap: "8px", 
    padding: "0 0 8px" 
  },

  priceValue: { 
    color: "#111827", 
    fontSize: "15px" 
  },

  priceValueDark: { 
    color: "#f9fafb" 
  },

  vencimentoSummary: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: "8px", 
    padding: "0 0 8px" 
  },

  vencimentoValue: { 
    color: "#111827", 
    fontSize: "15px" 
  },

  vencimentoValueDark: { 
    color: "#f9fafb" 
  },

  stockAdjustment: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
  },

  stockAdjustmentDark: {
    borderColor: "var(--border-color)",
  },

  operationButtons: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "8px",
  },

  operationButton: {
    flex: 1,
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
    color: "#334155",
    padding: "9px 10px",
    cursor: "pointer",
    fontWeight: 600,
  },

  operationButtonDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#e5e7eb",
  },

  operationButtonActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
    color: "#166534",
  },

  operationButtonRemoveActive: {
    backgroundColor: "#fee2e2",
    borderColor: "#dc2626",
    color: "#991b1b",
  },

  input: { 
    width: "90px", 
    textAlign: "center", 
    borderRadius: "8px",
     border: "1px solid var(--border-color)",
     padding: "8px 10px", 
     backgroundColor: "var(--surface)",
     color: "#111827" 
    },

  inputDark: { 
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb" 
  },

  stockPreview: {
    gridColumn: "1 / -1",
    color: "#475569",
    fontSize: "13px",
  },

  stockPreviewDark: {
    color: "#cbd5e1",
  },

  stockPreviewError: {
    color: "#b91c1c",
  },

  stockPreviewErrorDark: {
    color: "#fca5a5",
  },

  confirmButton: {
    gridColumn: "1 / -1",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "var(--accent-color)",
    color: "#ffffff",
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },

  confirmButtonDark: {
    backgroundColor: "#334155",
  },

  confirmButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  toggleButton: { 
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--surface)",
    color: "#111827", 
    borderRadius: "8px", 
    padding: "8px 12px", 
    cursor: "pointer" 
  },

  toggleButtonDark: { 
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb" 
  },
};