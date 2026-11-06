
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { ThemeContext } from "../contexts/ThemeContext";
import { buscarFornecedores } from "../services/fornecedoresService";

export default function Produtos() {
  const { produtos, loading, error } = useProdutos();
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");

  useEffect(() => {
    const carregarFornecedores = async () => {
      try {
        const dados = await buscarFornecedores();
        setFornecedores(dados || []);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
      }
    };

    carregarFornecedores();
  }, []);

  const fornecedoresPorId = useMemo(() => {
    const map = new Map();

    (Array.isArray(fornecedores) ? fornecedores : []).forEach((f) => {
      const id = f.Id ?? f.id ?? f.idFornecedor ?? f.IdFornecedor;

      if (id !== undefined && id !== null) {
        map.set(String(id), f);
      }
    });

    return map;
  }, [fornecedores]);

  const encontrarNomeFornecedor = (id) => {
    if (id === undefined || id === null || id === "") return "";

    const f = fornecedoresPorId.get(String(id));

    return f ? (f.Nome ?? f.nome ?? "") : `Fornecedor #${id}`;
  };

  const obterFornecedorPorId = (id) => {
    if (id === undefined || id === null || id === "") return null;

    return fornecedoresPorId.get(String(id)) || null;
  };

  const formatarDataLocal = (data) => {
    const dataLocal = new Date(data);

    if (Number.isNaN(dataLocal.getTime())) return "";

    const offset = dataLocal.getTimezoneOffset();
    const localDate = new Date(dataLocal.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 10);
  };

  const getId = (p) =>
    p?.Id ?? p?.id ?? p?.IdProduto ?? p?.idProduto ?? p?.id;

  const getNome = (p) => p?.Nome ?? p?.nome ?? "";

  const getPreco = (p) =>
    Number(p?.Preco ?? p?.preco ?? p?.Valor ?? p?.valor ?? 0);

  const getCusto = (p) => {
    const custo = p?.Custo ?? p?.custo;
    if (custo === undefined || custo === null || custo === "") return null;

    const valor = Number(custo);
    return Number.isFinite(valor) ? valor : null;
  };

  const getQuantidade = (p) =>
    Number(p?.Quantidade ?? p?.quantidade ?? p?.Estoque ?? p?.estoque ?? 0);

  const getDataVenc = (p) =>
    p?.DataVenc ??
    p?.dataVenc ??
    p?.dataVencimento ??
    p?.DataVencimento ??
    p?.dataVenc;

  const getIdFornecedorFromProduct = (p) =>
    p?.IdFornecedor ?? p?.idFornecedor ?? p?.id_fornecedor;

  const hoje = new Date();

  const isExpired = (p) => {
    const dv = getDataVenc(p);

    if (!dv) return false;

    const d = new Date(dv);

    if (Number.isNaN(d.getTime())) return false;

    return d < new Date(hoje.toDateString());
  };

  const produtosEnriquecidos = (Array.isArray(produtos) ? produtos : []).map(
    (p) => ({
      produto: p,
      id: getId(p),
      nome: getNome(p),
      preco: getPreco(p),
      custo: getCusto(p),
      lucroUnitario: getCusto(p) === null
        ? null
        : getPreco(p) - getCusto(p),
      quantidade: getQuantidade(p),
      dataVenc: getDataVenc(p),
      fornecedorNome: encontrarNomeFornecedor(
        getIdFornecedorFromProduct(p)
      ),
      fornecedorObj: obterFornecedorPorId(
        getIdFornecedorFromProduct(p)
      ),
    })
  );

  const produtosFiltrados = produtosEnriquecidos.filter((item) => {
    if (
      quantidadeMinima !== "" &&
      item.quantidade <= Number(quantidadeMinima)
    ) {
      return false;
    }

    if (!busca) return true;

    const termo = String(busca).trim().toLowerCase();

    if (!termo) return true;

    return (
      String(item.id).toLowerCase().includes(termo) ||
      String(item.nome).toLowerCase().includes(termo) ||
      String(item.fornecedorNome).toLowerCase().includes(termo)
    );
  });

  if (loading) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <header style={styles.header}>
            <div>
              <h1
                style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}
              >
                Produtos
              </h1>

              <p
                style={{
                  ...styles.subtitle,
                  ...(isDark ? styles.subtitleDark : {}),
                }}
              >
                Consulte os produtos cadastrados na loja.
              </p>
            </div>

            <div style={styles.headerActions}>
              <div
                style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}
              >
                0 produtos
              </div>

              <Link to="/produtos/cadastrar" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    ...styles.primaryButton,
                    ...(isDark ? styles.primaryButtonDark : {}),
                  }}
                >
                  + Novo produto
                </button>
              </Link>
            </div>
          </header>

          <div style={styles.centerContent}>
            <p style={{ ...(isDark ? styles.textDark : {}) }}>
              Carregando produtos
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <header style={styles.header}>
            <div>
              <h1
                style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}
              >
                Produtos
              </h1>

              <p
                style={{
                  ...styles.subtitle,
                  ...(isDark ? styles.subtitleDark : {}),
                }}
              >
                Consulte os produtos cadastrados na loja.
              </p>
            </div>

            <div style={styles.headerActions}>
              <div
                style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}
              >
                0 produtos
              </div>

              <Link to="/produtos/cadastrar" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    ...styles.primaryButton,
                    ...(isDark ? styles.primaryButtonDark : {}),
                  }}
                >
                  + Novo produto
                </button>
              </Link>
            </div>
          </header>

          <div style={styles.centerContent}>
            <div
              style={{ ...styles.error, ...(isDark ? styles.errorDark : {}) }}
            >
              Erro ao carregar os produtos.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        <header style={styles.header}>
          <div>
            <h1
              style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}
            >
              Produtos
            </h1>

            <p
              style={{
                ...styles.subtitle,
                ...(isDark ? styles.subtitleDark : {}),
              }}
            >
              Consulte os produtos cadastrados na loja.
            </p>
          </div>

          <div style={styles.headerActions}>
            <div
              style={{
                ...styles.total,
                ...(isDark ? styles.totalDark : {}),
              }}
            >
              {produtosFiltrados.length}{" "}
              {produtosFiltrados.length === 1 ? "produto" : "produtos"}
            </div>

            <Link to="/produtos/cadastrar" style={{ textDecoration: "none" }}>
              <button
                style={{
                  ...styles.primaryButton,
                  ...(isDark ? styles.primaryButtonDark : {}),
                }}
              >
                + Novo produto
              </button>
            </Link>
          </div>
        </header>

        <section
          style={{
            ...styles.filtersCard,
            ...(isDark ? styles.filtersCardDark : {}),
          }}
          aria-label="Filtros de produtos"
        >
          <div style={styles.filtersHeader}>
            <div>
              <h2
                style={{
                  ...styles.filtersTitle,
                  ...(isDark ? styles.filtersTitleDark : {}),
                }}
              >
                Pesquisar e filtrar
              </h2>
              <p
                style={{
                  ...styles.filtersDescription,
                  ...(isDark ? styles.filtersDescriptionDark : {}),
                }}
              >
                Busque pelo produto, código ou fornecedor e filtre pelo estoque.
              </p>
            </div>

            {(busca || quantidadeMinima !== "") && (
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  setQuantidadeMinima("");
                }}
                style={{
                  ...styles.clearFilterButton,
                  ...(isDark ? styles.clearFilterButtonDark : {}),
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div style={styles.filtersGrid}>
            <label
              htmlFor="busca-produtos"
              style={{
                ...styles.filterField,
                ...(isDark ? styles.filterFieldDark : {}),
              }}
            >
              <span>Pesquisar produtos</span>
              <input
                id="busca-produtos"
                type="search"
                placeholder="Nome, código ou fornecedor"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                style={{
                  ...styles.filterInput,
                  ...(isDark ? styles.filterInputDark : {}),
                }}
              />
            </label>

            <label
              htmlFor="quantidade-minima-produtos"
              style={{
                ...styles.filterField,
                ...(isDark ? styles.filterFieldDark : {}),
              }}
            >
              <span>Quantidade maior que</span>
              <input
                id="quantidade-minima-produtos"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Ex.: 10"
                value={quantidadeMinima}
                onChange={(event) => setQuantidadeMinima(event.target.value)}
                style={{
                  ...styles.filterInput,
                  ...(isDark ? styles.filterInputDark : {}),
                }}
              />
            </label>
          </div>
        </section>

        <section style={styles.content}>
          {produtosFiltrados.length === 0 ? (
            <div
              style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}
            >
              <span className="material-symbols-outlined">
                inventory_2
              </span>

              <p style={{ ...(isDark ? styles.textDark : {}) }}>
                {busca || quantidadeMinima !== ""
                  ? "Nenhum produto encontrado para os filtros selecionados."
                  : "Nenhum produto encontrado."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {produtosFiltrados.map((item) => {
                const img =
                  item.produto.imagem ||
                  item.produto.Imagem ||
                  item.produto.imagemUrl ||
                  null;

                const imageUrl = img
                  ? `http://localhost:8000${img}`
                  : null;

                return (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/produtos/${item.id}`)}
                    style={{
                      backgroundColor: "var(--surface-muted)",
                      color: "var(--text-primary)",
                      padding: 16,
                      borderRadius: 8,
                      border: "1px solid var(--border-color)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 8px 16px rgba(0, 0, 0, 0.4)"
                        : "0 8px 16px rgba(0, 0, 0, 0.1)";

                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        height: 140,
                        overflow: "hidden",
                        borderRadius: 8,
                        marginBottom: 10,
                        backgroundColor: "var(--surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.nome}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            objectPosition: "center",
                          }}
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 48, color: "#9aa8b6" }}
                        >
                          inventory_2
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        margin: "6px 0",
                        fontSize: 16,
                        color: isDark ? "#f9fafb" : "#111c2d",
                      }}
                    >
                      {item.nome}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <strong
                        style={{ color: isDark ? "#bbf7d0" : "#047857" }}
                      >
                        {item.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </strong>

                      <span
                        style={{
                          color:
                            item.quantidade <= 0
                              ? "#b91c1c"
                              : isDark
                                ? "#d1d5db"
                                : "#444",
                        }}
                      >
                        {item.quantidade} unidades
                      </span>
                    </div>

                    <div
                      style={{
                        marginBottom: 8,
                        fontSize: 13,
                        color: isDark ? "#cbd5e1" : "#55616a",
                      }}
                    >
                      Custo unitário:{" "}
                      {item.custo === null
                        ? "Não informado"
                        : item.custo.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      <div
                        style={{
                          marginTop: 4,
                          color: item.lucroUnitario !== null && item.lucroUnitario < 0
                            ? "#b91c1c"
                            : isDark
                              ? "#86efac"
                              : "#047857",
                        }}
                      >
                        {item.lucroUnitario === null
                          ? "Lucro não calculado (custo ausente)"
                          : `${item.lucroUnitario < 0 ? "Prejuízo" : "Lucro"} por unidade: ${item.lucroUnitario.toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" }
                            )}`}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: isDark ? "#cbd5e1" : "#55616a",
                      }}
                    >
                      <div>
                        Fornecedor: {item.fornecedorNome || "—"}
                      </div>

                      <div>
                        Vencimento:{" "}
                        {item.dataVenc
                          ? formatarDataLocal(item.dataVenc)
                          : "—"}
                      </div>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    backgroundColor: "var(--surface)",
  },

  layoutDark: {
    backgroundColor: "var(--app-background)",
  },

  page: {
    marginLeft: "256px",
    minHeight: "100vh",
    padding: "30px 25px",
    boxSizing: "border-box",
  },

  pageDark: {
    backgroundColor: "var(--surface)",
  },

  header: {
    maxWidth: "1150px",
    margin: "0 0 25px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#243447",
  },

  titleDark: {
    color: "#f9fafb",
  },

  subtitle: {
    marginTop: "7px",
    marginBottom: 0,
    fontSize: "15px",
    color: "#718096",
  },

  subtitleDark: {
    color: "#d1d5db",
  },

  total: {
    backgroundColor: "var(--surface)",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    color: "#243447",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
  },

  totalDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  primaryButton: {
    border: "none",
    backgroundColor: "var(--accent-color)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryButtonDark: {
    backgroundColor: "var(--accent-color)",
  },

  filtersCard: {
    maxWidth: "1150px",
    margin: "0 0 20px",
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

  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    outline: "none",
  },

  filterInputDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  content: {
    width: "100%",
    maxWidth: "1150px",
    margin: "0",
  },

  centerContent: {
    maxWidth: "1150px",
    margin: "0",
  },

  empty: {
    backgroundColor: "var(--surface)",
    borderRadius: "12px",
    padding: "50px",
    textAlign: "center",
    color: "#718096",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  emptyDark: {
    backgroundColor: "var(--surface)",
    color: "#d1d5db",
  },

  error: {
    backgroundColor: "#ffe5e5",
    color: "#b00020",
    padding: "20px",
    borderRadius: "10px",
  },

  errorDark: {
    backgroundColor: "#3f1721",
    color: "#fecdd3",
  },

  textDark: {
    color: "#e5e7eb",
  },

  clearFilterButton: {
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    padding: "9px 10px",
    backgroundColor: "var(--surface)",
    color: "#243447",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },

  clearFilterButtonDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

};
