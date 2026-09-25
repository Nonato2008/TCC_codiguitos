import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { ThemeContext } from "../contexts/ThemeContext";
import { buscarFornecedores } from "../services/fornecedoresService";

export default function Produtos() {
  // Hook que carrega a lista de vendas
  const { produtos, loading, error } = useProdutos();

  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Lista de fornecedores (para mostrar o nome a partir do IdVendedor)
  const [fornecedores, setFornecedores] = useState([]);

  // Filtro de data (input do tipo date)
  const [dataFiltro, setDataFiltro] = useState("");
  // Busca livre por nome / id / fornecedor
  const [busca, setBusca] = useState("");

  // Busca os fornecedores uma única vez ao montar o componente
  useEffect(() => {
    const carregarFornecedores = async () => {
      try {
        const dados = await buscarFornecedores();
        setFornecedores(dados || []);
      } catch (error) {
        console.error("Erro ao buscar vendedores:", error);
      }
    };

    carregarFornecedores();
  }, []);

  // Cria um mapa em memória para lookup rápido por id
  const fornecedoresPorId = useMemo(() => {
    const map = new Map();
    (Array.isArray(fornecedores) ? fornecedores : []).forEach((f) => {
      const id = f.Id ?? f.id ?? f.idFornecedor ?? f.IdFornecedor;
      if (id !== undefined && id !== null) map.set(String(id), f);
    });
    return map;
  }, [fornecedores]);

  // Retorna o nome do fornecedor a partir do id (aceita Id ou id)
  const encontrarNomeFornecedor = (id) => {
    if (id === undefined || id === null || id === "") return "";
    const f = fornecedoresPorId.get(String(id));
    return f ? (f.Nome ?? f.nome ?? "") : `Fornecedor #${id}`;
  };

  // Retorna o objeto completo do fornecedor ou null
  const obterFornecedorPorId = (id) => {
    if (id === undefined || id === null || id === "") return null;
    return fornecedoresPorId.get(String(id)) || null;
  };

  // Converte uma data para o formato YYYY-MM-DD respeitando o fuso local
  // (usado para comparar com o valor do input type="date")
  const formatarDataLocal = (data) => {
    const dataLocal = new Date(data);
    if (Number.isNaN(dataLocal.getTime())) return "";

    const offset = dataLocal.getTimezoneOffset();
    const localDate = new Date(dataLocal.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 10);
  };

  // Helpers para normalizar campos do produto (aceita variações de Pascal/camelCase)
  const getId = (p) => p?.Id ?? p?.id ?? p?.IdProduto ?? p?.idProduto ?? p?.id;
  const getNome = (p) => p?.Nome ?? p?.nome ?? "";
  const getPreco = (p) =>
    Number(p?.Preco ?? p?.preco ?? p?.Valor ?? p?.valor ?? 0);
  const getQuantidade = (p) =>
    Number(p?.Quantidade ?? p?.quantidade ?? p?.Estoque ?? p?.estoque ?? 0);
  const getDataVenc = (p) =>
    p?.DataVenc ??
    p?.dataVenc ??
    p?.dataVencimento ??
    p?.DataVencimento ??
    p?.dataVenc;
  const getIdFornecedorFromProduct = (p) => p?.idFornecedor;

  const hoje = new Date();
  const isExpired = (p) => {
    const dv = getDataVenc(p);
    if (!dv) return false;
    const d = new Date(dv);
    if (Number.isNaN(d.getTime())) return false;
    return d < new Date(hoje.toDateString());
  };

  // Filtra os produtos pela data selecionada (data de cadastro ou vencimento) e pelo termo de busca
  const produtosEnriquecidos = (Array.isArray(produtos) ? produtos : []).map(
    (p) => ({
      produto: p,
      id: getId(p),
      nome: getNome(p),
      preco: getPreco(p),
      quantidade: getQuantidade(p),
      dataVenc: getDataVenc(p),
      fornecedorNome: encontrarNomeFornecedor(getIdFornecedorFromProduct(p)),
      fornecedorObj: obterFornecedorPorId(getIdFornecedorFromProduct(p)),
    }),
  );

  const produtosFiltrados = produtosEnriquecidos.filter((item) => {
    if (dataFiltro) {
      const dataProduto =
        item.produto.dataCad ??
        item.produto.DataCad ??
        item.produto.dataVenc ??
        item.produto.DataVenc;
      const dataProdutoFormatada = formatarDataLocal(dataProduto);
      if (dataProdutoFormatada !== dataFiltro) return false;
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

  // Estado de carregamento
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

            <div style={styles.headerRight}>
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

  // Estado de erro
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

            <div style={styles.headerRight}>
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

          <div style={styles.headerRight}>
            {/* Contador dinâmico (muda conforme o filtro) */}
            <div
              style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}
            >
              {produtosFiltrados.length}{" "}
              {produtosFiltrados.length === 1 ? "produto" : "produtos"}
            </div>

            {/* Busca por nome / id / fornecedor */}
            <input
              type="text"
              placeholder="Buscar por nome, id ou fornecedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                ...styles.dateInput,
                ...(isDark ? styles.dateInputDark : {}),
                minWidth: "260px",
              }}
              aria-label="Buscar produtos"
            />

            {/* Filtro por data */}
            <input
              type="date"
              value={dataFiltro}
              onChange={(event) => setDataFiltro(event.target.value)}
              style={{
                ...styles.dateInput,
                ...(isDark ? styles.dateInputDark : {}),
              }}
              aria-label="Filtrar produtos por data"
            />

            {/* Botão "Limpar" só aparece se houver filtro ativo */}
            {dataFiltro && (
              <button
                type="button"
                onClick={() => setDataFiltro("")}
                style={{
                  ...styles.clearFilterButton,
                  ...(isDark ? styles.clearFilterButtonDark : {}),
                }}
              >
                Limpar
              </button>
            )}

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

        <section style={styles.content}>
          {produtosFiltrados.length === 0 ? (
            <div
              style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <p style={{ ...(isDark ? styles.textDark : {}) }}>
                {dataFiltro
                  ? "Nenhum produto encontrado para a data selecionada."
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
                const imageUrl = img ? `http://localhost:8000${img}` : null;
                return (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/produtos/${item.id}`)}
                    style={{
                      background: isDark ? "#0b1220" : "#fff",
                      padding: 16,
                      borderRadius: 8,
                      border: "1px solid #e6edf3",
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
                        background: "#f3f6fa",
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
                            objectFit: "cover",
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
                      <strong style={{ color: isDark ? "#bbf7d0" : "#047857" }}>
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
                        fontSize: 13,
                        color: isDark ? "#cbd5e1" : "#55616a",
                      }}
                    >
                      <div>Fornecedor: {item.fornecedorNome || "—"}</div>
                      <div>
                        Vencimento:{" "}
                        {item.dataVenc ? formatarDataLocal(item.dataVenc) : "—"}
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
    backgroundColor: "#f5f6f8",
  },
  layoutDark: {
    backgroundColor: "#0f172a",
  },
  page: {
    marginLeft: "363px",
    minHeight: "100vh",
    padding: "30px 25px",
    boxSizing: "border-box",
  },
  pageDark: {
    backgroundColor: "#111827",
  },
  header: {
    maxWidth: "1150px",
    margin: "0 0 25px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
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
    backgroundColor: "#ffffff",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    color: "#243447",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
  },
  totalDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  primaryButton: {
    border: "none",
    backgroundColor: "#303e51",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  primaryButtonDark: {
    backgroundColor: "#2563eb",
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
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "50px",
    textAlign: "center",
    color: "#718096",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  emptyDark: {
    backgroundColor: "#1f2937",
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
  dateInput: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "9px 10px",
    backgroundColor: "#ffffff",
    color: "#243447",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
  },
  dateInputDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  clearFilterButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "9px 10px",
    backgroundColor: "#f8fafc",
    color: "#243447",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
  clearFilterButtonDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
};
