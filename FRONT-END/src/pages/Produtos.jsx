import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext, useMemo } from "react";
import { PackageCheck, PackageX, Search, TriangleAlert } from "lucide-react";
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

  // Busca livre por nome / id / fornecedor
  const [busca, setBusca] = useState("");
  const [filtroEstoque, setFiltroEstoque] = useState("todos");

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
    if (id === undefined || id === null || id === "") return "Sem fornecedor";
    const f = fornecedoresPorId.get(String(id));
    return f ? (f.Nome ?? f.nome ?? "Sem fornecedor") : "Sem fornecedor";
  };

  // Retorna o objeto completo do fornecedor ou null
  const obterFornecedorPorId = (id) => {
    if (id === undefined || id === null || id === "") return null;
    return fornecedoresPorId.get(String(id)) || null;
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

  const validadeProduto = (dataVenc) => {
    if (!dataVenc) return { tipo: "sem-data", rotulo: "Sem validade" };
    const texto = String(dataVenc);
    const partes = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const data = partes
      ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
      : new Date(dataVenc);
    if (Number.isNaN(data.getTime())) return { tipo: "sem-data", rotulo: "Sem validade" };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dias = Math.ceil((data - hoje) / 86400000);
    if (dias < 0) return { tipo: "vencido", rotulo: "Vencido" };
    if (dias < 30) return { tipo: "proximo", rotulo: dias === 0 ? "Vence hoje" : `Vence em ${dias} dias` };
    return { tipo: "valido", rotulo: "Na validade" };
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

  const produtosPorEstoque = produtosEnriquecidos.filter((item) => {
    if (filtroEstoque === "comEstoque") return item.quantidade > 0;
    if (filtroEstoque === "semEstoque") return item.quantidade <= 0;
    return true;
  });

  const produtosFiltrados = produtosPorEstoque.filter((item) => {
    const termo = String(busca).trim().toLocaleLowerCase("pt-BR");
    if (!termo) return true;
    return [item.id, item.nome, item.fornecedorNome]
      .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo));
  });

  const contagemComEstoque = produtosEnriquecidos.filter((item) => item.quantidade > 0).length;
  const contagemSemEstoque = produtosEnriquecidos.length - contagemComEstoque;

  // Estado de carregamento
  if (loading) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main className="products-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
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

        <main className="products-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
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

      <main className="products-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        <header className="products-page-header" style={styles.header}>
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

          <div className="products-header-actions">
            <span className="products-count-pill">{produtosFiltrados.length} {produtosFiltrados.length === 1 ? "produto" : "produtos"}</span>

            <Link to="/produtos/cadastrar" style={{ textDecoration: "none" }}>
              <button className="products-new-button" type="button"><span aria-hidden="true">+</span>Novo produto</button>
            </Link>
          </div>
        </header>

        <section className="products-controls" aria-label="Buscar e filtrar produtos">
          <label className="products-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nome, código ou fornecedor"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              aria-label="Buscar produtos"
            />
            {busca && <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca"><X size={15} /></button>}
          </label>

          <div className="products-filter-chips" role="group" aria-label="Filtrar produtos por estoque">
            <button type="button" className={filtroEstoque === "todos" ? "is-active" : ""} aria-pressed={filtroEstoque === "todos"} onClick={() => setFiltroEstoque("todos")}>Todos<span>{produtosEnriquecidos.length}</span></button>
            <button type="button" className={filtroEstoque === "comEstoque" ? "is-active" : ""} aria-pressed={filtroEstoque === "comEstoque"} onClick={() => setFiltroEstoque("comEstoque")}><PackageCheck size={14} aria-hidden="true" />Com estoque<span>{contagemComEstoque}</span></button>
            <button type="button" className={filtroEstoque === "semEstoque" ? "is-active" : ""} aria-pressed={filtroEstoque === "semEstoque"} onClick={() => setFiltroEstoque("semEstoque")}><PackageX size={14} aria-hidden="true" />Sem estoque<span>{contagemSemEstoque}</span></button>
          </div>
        </section>

        <section className="products-content" style={styles.content}>
          {produtosFiltrados.length === 0 ? (
            <div
              style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <p style={{ ...(isDark ? styles.textDark : {}) }}>
                {busca || filtroEstoque !== "todos" ? "Nenhum produto corresponde à busca ou ao filtro selecionado." : "Nenhum produto encontrado."}
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {produtosFiltrados.map((item) => {
                const img =
                  item.produto.imagem ||
                  item.produto.Imagem ||
                  item.produto.imagemUrl ||
                  null;
                const imageUrl = img ? (/^https?:\/\//i.test(img) ? img : `http://localhost:8000${img.startsWith("/") ? img : `/${img}`}`) : null;
                const validade = validadeProduto(item.dataVenc);
                return (
                  <article
                    key={item.id}
                    onClick={() => navigate(`/produtos/${item.id}`)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate(`/produtos/${item.id}`); } }}
                    tabIndex={0}
                    aria-label={`Ver detalhes de ${item.nome}`}
                    className="product-list-card"
                    style={{
                      background: isDark ? "var(--color-surface)" : "var(--color-surface)",
                    }}
                  >
                    <div className="product-list-card__image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.nome}
                          onError={(event) => { event.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <PackageX size={36} aria-hidden="true" />
                      )}
                    </div>

                    <div className="product-list-card__body">
                      <div className="product-list-card__badges">
                        {item.quantidade <= 0 ? (
                          <span className="product-stock-badge is-out">Sem estoque</span>
                        ) : (
                          <span className="product-stock-badge is-in"><PackageCheck size={12} aria-hidden="true" />Disponível</span>
                        )}
                        {validade.tipo === "proximo" && <span className="product-expiry-badge is-soon"><TriangleAlert size={12} aria-hidden="true" />{validade.rotulo}</span>}
                        {validade.tipo === "vencido" && <span className="product-expiry-badge is-expired"><TriangleAlert size={12} aria-hidden="true" />Vencido</span>}
                      </div>

                      <h3 className="product-list-card__name">{item.nome}</h3>
                      <div className="product-list-card__primary-info">
                        <strong className="product-list-card__price">
                        {item.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </strong>
                        <span className={`product-list-card__quantity${item.quantidade <= 0 ? " is-empty" : ""}`}>
                          {item.quantidade} {item.quantidade === 1 ? "unidade" : "unidades"}
                        </span>
                      </div>

                      <div className="product-list-card__secondary-info">
                        {item.fornecedorNome !== "Sem fornecedor" && <span>Fornecedor: {item.fornecedorNome}</span>}
                        <span className={validade.tipo === "proximo" ? "is-soon" : validade.tipo === "vencido" ? "is-expired" : ""}>
                          Vencimento: {item.dataVenc ? formatarDataLocal(item.dataVenc) : "—"}
                        </span>
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
