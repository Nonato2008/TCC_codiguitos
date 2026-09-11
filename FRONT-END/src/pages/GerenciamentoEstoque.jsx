import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { useFornecedores } from "../hooks/useFornecedores";
import { atualizarProduto } from "../services/produtosService";

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

function montarPayloadProduto(produto, quantidadeAtual) {
  return {
    idFornecedor: produto.IdFornecedor ?? produto.idFornecedor ?? 1,
    nome: produto.nome ?? produto.Nome ?? "",
    preco: Number(produto.Preco ?? produto.preco ?? 0),
    quantidade: Number(quantidadeAtual ?? produto.quantidade ?? 0),
    dataVenc: produto.DataVenc ?? produto.dataVenc ?? "2025-12-31",
  };
}

export default function GerenciamentoEstoque() {
  const { produtos, loading, error } = useProdutos();
  const { fornecedores } = useFornecedores();
  const [listaProdutos, setListaProdutos] = useState([]);

  const getFornecedorNome = (produto) => {
    const idFornecedor = Number(produto.IdFornecedor ?? produto.idFornecedor ?? 0);
    const fornecedor = (fornecedores || []).find(
      (item) => Number(item.Id ?? item.id ?? 0) === idFornecedor
    );

    return fornecedor?.Nome ?? fornecedor?.nome ?? "Fornecedor não informado";
  };

  useEffect(() => {
    setListaProdutos(
      (produtos || []).map((produto) => ({
        ...produto,
        id:
          produto.Id ?? produto.id ?? produto._id ?? produto.idProduto ?? produto.Nome ?? produto.nome,
        nome: produto.Nome ?? produto.nome,
        quantidade: Number(produto.Quantidade ?? produto.quantidade ?? 0),
        quantidadeAjuste: 0,
        ativoParaVenda:
          produto.ativoParaVenda ?? (produto.Status ? produto.Status !== "Esgotado" : true),
        imagem:
          produto.Quantidade === 0 || produto.quantidade === 0
            ? "esgotado.jpg"
            : getImagemProduto(produto.Imagem ?? produto.imagem),
      }))
    );
  }, [produtos]);

  function atualizarQuantidadeEntrada(
    event,
    idProduto
  ) {
    const valorDigitado =
      event.target.value;

    if (valorDigitado === "") {
      setListaProdutos((atual) =>
        atual.map((produto) =>
          produto.id === idProduto
            ? {
                ...produto,
                quantidadeAjuste: "",
              }
            : produto
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
          ? {
              ...produto,
              quantidadeAjuste: Math.max(
                0,
                Math.floor(valor)
              ),
            }
          : produto
      )
    );
  }

  async function salvarProdutoNoBanco(idProduto, quantidadeAtual) {
    const produto = listaProdutos.find((p) => p.id === idProduto);
    if (!produto) return;

    const payload = montarPayloadProduto(produto, quantidadeAtual);
    await atualizarProduto(idProduto, payload);
  }

  async function ajustarEstoque(tipo, idProduto) {
    const produtoAtual = listaProdutos.find((produto) => produto.id === idProduto);
    const ajuste = Number(produtoAtual?.quantidadeAjuste ?? 0);

    if (!produtoAtual || !Number.isFinite(ajuste) || ajuste <= 0) {
      return;
    }

    const quantidadeAnterior = produtoAtual.quantidade;
    const novaQuantidade =
      tipo === "mais"
        ? produtoAtual.quantidade + ajuste
        : Math.max(0, produtoAtual.quantidade - ajuste);

    setListaProdutos((atual) =>
      atual.map((produto) => {
        if (
          produto.id !== idProduto
        ) {
          return produto;
        }

        return {
          ...produto,
          quantidade: novaQuantidade,
          quantidadeAjuste: 0,
        };
      })
    );

    try {
      await salvarProdutoNoBanco(idProduto, novaQuantidade);
    } catch (err) {
      console.error(err);
      setListaProdutos((atual) =>
        atual.map((produto) =>
          produto.id === idProduto
            ? { ...produto, quantidade: quantidadeAnterior, quantidadeAjuste: ajuste }
            : produto
        )
      );
      alert("Falha ao atualizar o estoque no banco de dados.");
    }
  }

  function alternarDisponibilidade(
    idProduto
  ) {
    setListaProdutos((atual) =>
      atual.map((produto) =>
        produto.id === idProduto
          ? {
              ...produto,
              ativoParaVenda:
                !produto.ativoParaVenda,
            }
          : produto
      )
    );
  }

  function abrirEntradaMercadorias() {
    navigate("/entradaEstoque");
  }

  return (
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.page}>
        <header style={styles.header}>

          <div>
            <h2 style={styles.title}>
              Gerenciamento de Estoque
            </h2>

            <p style={styles.subtitle}>
              Ajuste o estoque dos produtos
              cadastrados e controle a
              disponibilidade para venda.
            </p>
          </div>

          <button
            type="button"
            onClick={
              abrirEntradaMercadorias
            }
            style={
              styles.entradaButton
            }
          >
            + Entrada de Mercadorias
          </button>

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
                    <div style={styles.fornecedorName}>{getFornecedorNome(produto)}</div>

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

        {!loading && error && (
          <div
            style={
              styles.emptyStateError
            }
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          listaProdutos.length === 0 && (
            <div
              style={
                styles.emptyState
              }
            >
              Nenhum produto cadastrado.
            </div>
          )}

        {!loading &&
          !error &&
          listaProdutos.length > 0 && (
            <div
              style={
                styles.listContainer
              }
            >
              {listaProdutos.map(
                (produto) => (
                  <section
                    key={produto.id}
                    style={styles.card}
                  >
                    <div
                      style={
                        styles.productContent
                      }
                    >
                      <div
                        style={
                          styles.imageBox
                        }
                      >
                        <img
                          src={
                            produto.imagem
                          }
                          alt={
                            produto.nome
                          }
                          style={
                            styles.productImage
                          }
                        />
                      </div>

                      <div
                        style={
                          styles.infoArea
                        }
                      >
                        <div
                          style={
                            styles.badgeRow
                          }
                        >
                          <span
                            style={
                              styles.badge
                            }
                          >
                            {produto.categoria ||
                              "Produto"}
                          </span>

                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(produto.ativoParaVenda
                                ? styles.statusAtivo
                                : styles.statusInativo),
                            }}
                          >
                            {produto.ativoParaVenda
                              ? "Disponível para venda"
                              : "Desativado para venda"}
                          </span>
                        </div>

                        <h3
                          style={
                            styles.productName
                          }
                        >
                          {produto.nome}
                        </h3>

                        <div
                          style={
                            styles.stockSummary
                          }
                        >
                          <span
                            style={
                              styles.label
                            }
                          >
                            Estoque atual
                          </span>

                          <strong
                            style={
                              styles.stockValue
                            }
                          >
                            {produto.quantidade}{" "}
                            unidades
                          </strong>
                        </div>

                        <div
                          style={
                            styles.controlBox
                          }
                        >
                          <button
                            type="button"
                            style={
                              styles.circleButton
                            }
                            onClick={() =>
                              ajustarEstoque(
                                "menos",
                                produto.id
                              )
                            }
                            aria-label={`Diminuir estoque de ${produto.nome}`}
                          >
                            −
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={
                              produto.quantidadeAjuste
                            }
                            onChange={(
                              event
                            ) =>
                              atualizarQuantidadeEntrada(
                                event,
                                produto.id
                              )
                            }
                            style={
                              styles.input
                            }
                            aria-label={`Quantidade para ajustar o estoque de ${produto.nome}`}
                          />

                          <button
                            type="button"
                            style={
                              styles.circleButton
                            }
                            onClick={() =>
                              ajustarEstoque(
                                "mais",
                                produto.id
                              )
                            }
                            aria-label={`Aumentar estoque de ${produto.nome}`}
                          >
                            +
                          </button>
                        </div>

                        <div
                          style={
                            styles.actions
                          }
                        >
                          <button
                            type="button"
                            style={
                              produto.ativoParaVenda
                                ? styles.disableButton
                                : styles.enableButton
                            }
                            onClick={() =>
                              alternarDisponibilidade(
                                produto.id
                              )
                            }
                          >
                            {produto.ativoParaVenda
                              ? "Desativar para venda"
                              : "Ativar para venda"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )
              )}
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
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

  entradaButton: {
    border: "none",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    padding: "13px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
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
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.04)",
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
    margin: "0 0 6px",
    fontSize: "22px",
    color: "#111c2d",
    fontWeight: 700,
  },
  fornecedorName: {
    margin: "0 0 14px",
    fontSize: "14px",
    color: "#54657a",
    fontWeight: 600,
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