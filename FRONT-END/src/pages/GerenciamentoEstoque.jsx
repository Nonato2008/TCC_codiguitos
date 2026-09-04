import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";

function getImagemProduto(imagem) {
  if (!imagem) {
    return "/logo.png";
  }

  if (/^https?:\/\//i.test(imagem)) {
    return imagem;
  }

  const caminho = imagem.startsWith("/") ? imagem : `/${imagem}`;
  return `http://localhost:8000${caminho}`;
}

export default function GerenciamentoEstoque() {
  const { produtos, loading, error } = useProdutos();
  const [listaProdutos, setListaProdutos] = useState([]);

  useEffect(() => {
    setListaProdutos(
      (produtos || []).map((produto) => ({
        ...produto,
        id: produto.id ?? produto._id ?? produto.idProduto ?? produto.nome,
        nome: produto.nome || "Produto sem nome",
        quantidade: Number(produto.quantidade ?? 0),
        quantidadeAjuste: 1,
        ativoParaVenda: produto.ativoParaVenda ?? true,
        imagem: getImagemProduto(produto.imagem),
      }))
    );
  }, [produtos]);

  function atualizarQuantidadeEntrada(event, idProduto) {
    const valorDigitado = event.target.value;

    if (valorDigitado === "") {
      setListaProdutos((atual) =>
        atual.map((produto) =>
          produto.id === idProduto ? { ...produto, quantidadeAjuste: "" } : produto
        )
      );
      return;
    }

    const valor = Number(valorDigitado);

    if (Number.isNaN(valor)) {
      return;
    }

    setListaProdutos((atual) =>
      atual.map((produto) =>
        produto.id === idProduto
          ? { ...produto, quantidadeAjuste: Math.max(0, Math.floor(valor)) }
          : produto
      )
    );
  }

  function ajustarEstoque(tipo, idProduto) {
    const ajuste = Number(
      listaProdutos.find((produto) => produto.id === idProduto)?.quantidadeAjuste ?? 0
    );

    if (!Number.isFinite(ajuste) || ajuste <= 0) {
      return;
    }

    setListaProdutos((atual) =>
      atual.map((produto) => {
        if (produto.id !== idProduto) {
          return produto;
        }

        const novaQuantidade =
          tipo === "mais"
            ? produto.quantidade + ajuste
            : Math.max(0, produto.quantidade - ajuste);

        return {
          ...produto,
          quantidade: novaQuantidade,
          quantidadeAjuste: 1,
        };
      })
    );
  }

  function alternarDisponibilidade(idProduto) {
    setListaProdutos((atual) =>
      atual.map((produto) =>
        produto.id === idProduto
          ? { ...produto, ativoParaVenda: !produto.ativoParaVenda }
          : produto
      )
    );
  }

  return (
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.page}>
        <header style={styles.header}>
          <h2 style={styles.title}>Gerenciamento de Estoque</h2>
          <p style={styles.subtitle}>
            Ajuste o estoque dos produtos cadastrados e controle a disponibilidade para venda.
          </p>
        </header>

        {loading && <div style={styles.emptyState}>Carregando produtos...</div>}

        {!loading && error && <div style={styles.emptyStateError}>{error}</div>}

        {!loading && !error && listaProdutos.length === 0 && (
          <div style={styles.emptyState}>Nenhum produto cadastrado.</div>
        )}

        {!loading && !error && listaProdutos.length > 0 && (
          <div style={styles.listContainer}>
            {listaProdutos.map((produto) => (
              <section key={produto.id} style={styles.card}>
                <div style={styles.productContent}>
                  <div style={styles.imageBox}>
                    <img src={produto.imagem} alt={produto.nome} style={styles.productImage} />
                  </div>

                  <div style={styles.infoArea}>
                    <div style={styles.badgeRow}>
                      <span style={styles.badge}>{produto.categoria || "Produto"}</span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(produto.ativoParaVenda ? styles.statusAtivo : styles.statusInativo),
                        }}
                      >
                        {produto.ativoParaVenda ? "Disponível para venda" : "Desativado para venda"}
                      </span>
                    </div>

                    <h3 style={styles.productName}>{produto.nome}</h3>

                    <div style={styles.stockSummary}>
                      <span style={styles.label}>Estoque atual</span>
                      <strong style={styles.stockValue}>{produto.quantidade} unidades</strong>
                    </div>

                    <div style={styles.controlBox}>
                      <button
                        type="button"
                        style={styles.circleButton}
                        onClick={() => ajustarEstoque("menos", produto.id)}
                        aria-label={`Diminuir estoque de ${produto.nome}`}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={produto.quantidadeAjuste}
                        onChange={(event) => atualizarQuantidadeEntrada(event, produto.id)}
                        style={styles.input}
                        aria-label={`Quantidade para ajustar o estoque de ${produto.nome}`}
                      />

                      <button
                        type="button"
                        style={styles.circleButton}
                        onClick={() => ajustarEstoque("mais", produto.id)}
                        aria-label={`Aumentar estoque de ${produto.nome}`}
                      >
                        +
                      </button>
                    </div>

                    <div style={styles.actions}>
                      <button
                        type="button"
                        style={produto.ativoParaVenda ? styles.disableButton : styles.enableButton}
                        onClick={() => alternarDisponibilidade(produto.id)}
                      >
                        {produto.ativoParaVenda ? "Desativar para venda" : "Ativar para venda"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ))}
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
    backgroundColor: "#f3f5f9",
    fontFamily: "Inter, sans-serif",
  },
  page: {
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111c2d",
    fontWeight: 700,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#4a5568",
  },
  listContainer: {
    display: "grid",
    gap: "22px",
    maxWidth: "980px",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    padding: "28px",
  },
  productContent: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
  },
  imageBox: {
    width: "220px",
    height: "220px",
    borderRadius: "18px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  infoArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  badgeRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 700,
  },
  statusBadge: {
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 700,
  },
  statusAtivo: {
    backgroundColor: "#ecfdf5",
    color: "#166534",
  },
  statusInativo: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
  },
  productName: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
  },
  stockSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    color: "#64748b",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  stockValue: {
    fontSize: "28px",
    color: "#111c2d",
  },
  controlBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "8px",
  },
  circleButton: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#303e51",
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "120px",
    height: "52px",
    textAlign: "center",
    border: "1px solid #d7dfeb",
    borderRadius: "10px",
    fontSize: "22px",
    fontWeight: 600,
    outline: "none",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  actions: {
    marginTop: "8px",
  },
  disableButton: {
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  enableButton: {
    border: "none",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "18px 20px",
    color: "#4a5568",
    maxWidth: "980px",
  },
  emptyStateError: {
    backgroundColor: "#fff1f2",
    borderRadius: "12px",
    border: "1px solid #fecdd3",
    padding: "18px 20px",
    color: "#9f1239",
    maxWidth: "980px",
  },
};
