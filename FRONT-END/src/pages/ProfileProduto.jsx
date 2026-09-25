import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../contexts/ThemeContext";
import { buscarProdutos } from "../services/produtosService";
import { buscarFornecedores } from "../services/fornecedoresService";

export default function ProfileProduto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [produto, setProduto] = useState(null);
  const [fornecedor, setFornecedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarProduto = async () => {
      try {
        setLoading(true);
        const produtos = await buscarProdutos();
        
        // Normalizar ID para comparação
        const produtoEncontrado = (Array.isArray(produtos) ? produtos : []).find(
          (p) => String(p.Id ?? p.id) === String(id)
        );

        if (!produtoEncontrado) {
          setError("Produto não encontrado.");
          return;
        }

        setProduto(produtoEncontrado);

        // Buscar fornecedor se houver idFornecedor
        const idFornecedor = 
          produtoEncontrado.idFornecedor ?? 
          produtoEncontrado.IdFornecedor ?? 
          produtoEncontrado.IdFornecedor;

        if (idFornecedor) {
          const fornecedores = await buscarFornecedores();
          const fornecedorEncontrado = (Array.isArray(fornecedores) ? fornecedores : []).find(
            (f) => String(f.Id ?? f.id ?? f.idFornecedor ?? f.IdFornecedor) === String(idFornecedor)
          );
          if (fornecedorEncontrado) {
            setFornecedor(fornecedorEncontrado);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError("Erro ao carregar os dados do produto.");
      } finally {
        setLoading(false);
      }
    };

    carregarProduto();
  }, [id]);

  // Normalizadores
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

  const formatarDataLocal = (data) => {
    const dataLocal = new Date(data);
    if (Number.isNaN(dataLocal.getTime())) return "-";

    return dataLocal.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <p style={{ ...styles.loading, ...(isDark ? styles.loadingDark : {}) }}>
            Carregando informações do produto...
          </p>
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
          <div style={{ ...styles.error, ...(isDark ? styles.errorDark : {}) }}>
            {error}
          </div>
        </main>
      </div>
    );
  }

  // Produto não encontrado
  if (!produto) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <div style={{ ...styles.error, ...(isDark ? styles.errorDark : {}) }}>
            Produto não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const nome = getNome(produto);
  const preco = getPreco(produto);
  const quantidade = getQuantidade(produto);
  const dataVenc = getDataVenc(produto);
  const imagem = produto.imagem || produto.Imagem || produto.imagemUrl || null;
  const imageUrl = imagem ? `http://localhost:8000${imagem}` : null;
  const fornecedorNome = fornecedor?.Nome ?? fornecedor?.nome ?? `Fornecedor #${produto.IdFornecedor}`;

  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        {/* CABEÇALHO */}
        <div style={styles.header}>
          <div>
            <button
              onClick={() => navigate("/produtos")}
              style={{
                ...styles.backButton,
                ...(isDark ? styles.backButtonDark : {}),
              }}
            >
              ← Voltar
            </button>

            <p
              style={{
                ...styles.subtitle,
                ...(isDark ? styles.subtitleDark : {}),
              }}
            >
              Detalhes do produto
            </p>
          </div>
        </div>

        {/* INFORMAÇÕES DO PRODUTO */}
        <section
          style={{
            ...styles.infoCard,
            ...(isDark ? styles.infoCardDark : {}),
          }}
        >
          {/* Imagem do produto */}
          <div style={styles.imageContainer}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={nome}
                style={styles.productImage}
              />
            ) : (
              <div
                style={{
                  ...styles.noImage,
                  ...(isDark ? styles.noImageDark : {}),
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 64, color: "#9aa8b6" }}
                >
                  inventory_2
                </span>
              </div>
            )}
          </div>

          {/* Informações textuais */}
          <div style={styles.infoContent}>
            <div style={styles.infoItem}>
              <span
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                ID do Produto
              </span>

              <strong
                style={{
                  ...styles.value,
                  ...(isDark ? styles.valueDark : {}),
                }}
              >
                {produto.Id ?? produto.id}
              </strong>
            </div>

            <div style={styles.infoItem}>
              <span
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                Nome
              </span>

              <strong
                style={{
                  ...styles.value,
                  ...(isDark ? styles.valueDark : {}),
                }}
              >
                {nome}
              </strong>
            </div>

            <div style={styles.infoItem}>
              <span
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                Fornecedor
              </span>

              <strong
                style={{
                  ...styles.value,
                  ...(isDark ? styles.valueDark : {}),
                }}
              >
                {fornecedorNome}
              </strong>
            </div>

            <div style={styles.infoItem}>
              <span
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                Preço Unitário
              </span>

              <strong
                style={{
                  ...styles.totalValue,
                  ...(isDark ? styles.totalValueDark : {}),
                }}
              >
                {preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
            </div>

            <div style={styles.infoItem}>
              <span
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                Quantidade em Estoque
              </span>

              <strong
                style={{
                  ...styles.value,
                  color:
                    quantidade <= 0
                      ? "#b91c1c"
                      : isDark
                        ? "#bbf7d0"
                        : "#047857",
                  ...(isDark ? styles.valueDark : {}),
                }}
              >
                {quantidade} unidades
              </strong>
            </div>

            <div style={styles.infoItem}>
              <span
                style={{
                  ...styles.label,
                  ...(isDark ? styles.labelDark : {}),
                }}
              >
                Data de Vencimento
              </span>

              <strong
                style={{
                  ...styles.value,
                  ...(isDark ? styles.valueDark : {}),
                }}
              >
                {formatarDataLocal(dataVenc)}
              </strong>
            </div>
          </div>
        </section>

        {/* RESUMO */}
        <section
          style={{
            ...styles.summary,
            ...(isDark ? styles.summaryDark : {}),
          }}
        >
          <div>
            <span
              style={{
                ...styles.summaryLabel,
                ...(isDark ? styles.summaryLabelDark : {}),
              }}
            >
              Valor Total do Estoque
            </span>
          </div>

          <strong
            style={{
              ...styles.summaryValue,
              ...(isDark ? styles.summaryValueDark : {}),
            }}
          >
            {(preco * quantidade).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>
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
    padding: "25px 25px",
    boxSizing: "border-box",
  },

  pageDark: {
    backgroundColor: "#111827",
    color: "#f3f4f6",
  },

  header: {
    maxWidth: "1150px",
    marginBottom: "20px",
  },

  backButton: {
    padding: "7px 13px",
    border: "1px solid #ddd",
    borderRadius: "7px",
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "12px",
  },

  backButtonDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },

  subtitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600",
    color: "#243447",
  },

  subtitleDark: {
    color: "#f9fafb",
  },

  infoCard: {
    maxWidth: "1150px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    display: "flex",
    gap: 40,
    alignItems: "flex-start",
  },

  infoCardDark: {
    backgroundColor: "#1f2937",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },

  imageContainer: {
    flexShrink: 0,
    width: 200,
  },

  productImage: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 8,
  },

  noImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f3f6fa",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e6edf3",
  },

  noImageDark: {
    backgroundColor: "#0b1220",
    borderColor: "#4b5563",
  },

  infoContent: {
    flex: 1,
  },

  infoItem: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#718096",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  labelDark: {
    color: "#9ca3af",
  },

  value: {
    display: "block",
    fontSize: "16px",
    fontWeight: "600",
    color: "#111c2d",
  },

  valueDark: {
    color: "#f9fafb",
  },

  totalValue: {
    display: "block",
    fontSize: "18px",
    fontWeight: "700",
    color: "#047857",
  },

  totalValueDark: {
    color: "#bbf7d0",
  },

  summary: {
    maxWidth: "1150px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  summaryDark: {
    backgroundColor: "#1f2937",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },

  summaryLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  summaryLabelDark: {
    color: "#9ca3af",
  },

  summaryValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#047857",
  },

  summaryValueDark: {
    color: "#bbf7d0",
  },

  loading: {
    padding: "20px",
    color: "#718096",
    fontSize: "16px",
  },

  loadingDark: {
    color: "#d1d5db",
  },

  error: {
    maxWidth: "1150px",
    backgroundColor: "#ffe5e5",
    color: "#b00020",
    padding: "20px",
    borderRadius: "10px",
    fontSize: "16px",
  },

  errorDark: {
    backgroundColor: "#3f1721",
    color: "#fecdd3",
  },
};
