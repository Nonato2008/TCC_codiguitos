import { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { useFornecedores } from "../hooks/useFornecedores";
import { atualizarProduto } from "../services/produtosService";
import { formatErrorMessage } from "../utils/formatErrorMessage";
import { ThemeContext } from "../contexts/ThemeContext";

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

// Monta o payload de atualização do produto
// Normaliza nomes de campos que podem vir em PascalCase ou camelCase
function montarPayloadProduto(produto, quantidadeAtual) {
  return {
    idFornecedor: produto.IdFornecedor ?? produto.idFornecedor ?? 1,
    nome: produto.nome ?? produto.Nome ?? "",
    preco: Number(produto.Preco ?? produto.preco ?? 0),
    quantidade: Number(quantidadeAtual ?? produto.quantidade ?? 0),
    dataVenc: produto.DataVenc ?? produto.dataVenc,
  };
}

// Verifica se o produto está vencido com base na data de vencimento
function getStatusValidade(produto) {
  const dataVencimento = produto?.DataVenc ?? produto?.dataVenc ?? produto?.data_venc;

  if (!dataVencimento) {
    return { texto: "Na validade", tipo: "valid" };
  }

  const data = new Date(dataVencimento);
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

  // Lista local de produtos (permite ajustes otimistas sem refetch)
  const [listaProdutos, setListaProdutos] = useState([]);

  // Descobre o nome do fornecedor a partir do id do produto
  const getFornecedorNome = (produto) => {
    const idFornecedor = Number(produto.IdFornecedor ?? produto.idFornecedor ?? 0);
    const fornecedor = (fornecedores || []).find(
      (item) => Number(item.Id ?? item.id ?? 0) === idFornecedor
    );

    return fornecedor?.Nome ?? fornecedor?.nome ?? "Fornecedor não informado";
  };

  // Normaliza os produtos vindos do hook para o formato usado na tela
  // Adiciona campos auxiliares como quantidadeAjuste, ativoParaVenda e imagem
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
          quantidadeAjuste: 0,
          ativoParaVenda:
            produto.ativoParaVenda ?? (produto.Status ? produto.Status !== "Esgotado" : true),
          imagemOriginal,
          imagem: quantidadeAtual === 0 ? "esgotado.jpg" : imagemOriginal,
        };
      })
    );
  }, [produtos]);

  // Atualiza o input de ajuste de quantidade do produto
  // Aceita string vazia temporariamente para permitir apagar o valor
  function atualizarQuantidadeEntrada(event, idProduto) {
    const valorDigitado = event.target.value;

    if (valorDigitado === "") {
      setListaProdutos((atual) =>
        atual.map((produto) =>
          produto.id === idProduto
            ? { ...produto, quantidadeAjuste: "" }
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
          ? { ...produto, quantidadeAjuste: Math.max(0, Math.floor(valor)) }
          : produto
      )
    );
  }

  // Salva a nova quantidade do produto no banco de dados
  async function salvarProdutoNoBanco(idProduto, quantidadeAtual) {
    const produto = listaProdutos.find((p) => p.id === idProduto);
    if (!produto) return;

    const payload = montarPayloadProduto(produto, quantidadeAtual);
    await atualizarProduto(idProduto, payload);
  }

  // Ajusta o estoque somando ou subtraindo o valor informado
  // Faz atualização otimista e reverte em caso de erro
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

    // Atualiza a UI imediatamente (otimista)
    setListaProdutos((atual) =>
      atual.map((produto) => {
        if (produto.id !== idProduto) {
          return produto;
        }

        const imagemAtual = produto.imagemOriginal ?? produto.imagem ?? "/example.jpg";

        return {
          ...produto,
          quantidade: novaQuantidade,
          quantidadeAjuste: 0,
          imagem: novaQuantidade === 0 ? "esgotado.jpg" : imagemAtual,
        };
      })
    );

    try {
      await salvarProdutoNoBanco(idProduto, novaQuantidade);
    } catch (err) {
      console.error(err);

      // Reverte para os valores anteriores em caso de falha
      setListaProdutos((atual) =>
        atual.map((produto) =>
          produto.id === idProduto
            ? {
                ...produto,
                quantidade: quantidadeAnterior,
                quantidadeAjuste: ajuste,
                imagem:
                  quantidadeAnterior === 0 ? "esgotado.jpg" : produto.imagemOriginal ?? produto.imagem,
              }
            : produto
        )
      );

      alert(
        formatErrorMessage(
          err,
          "Falha ao atualizar o estoque no banco de dados."
        )
      );
    }
  }

  // Alterna o produto entre disponível/desativado para venda (apenas local)
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

        {loading && <div style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>Carregando produtos...</div>}

        {!loading && error && <div style={{ ...styles.emptyStateError, ...(isDark ? styles.emptyStateErrorDark : {}) }}>{error}</div>}

        {!loading && !error && listaProdutos.length === 0 && (
          <div style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>Nenhum produto cadastrado.</div>
        )}

        {!loading && !error && listaProdutos.length > 0 && (
          <div style={styles.listContainer}>
            {listaProdutos.map((produto) => {
              const validade = getStatusValidade(produto);

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
                            ...(produto.ativoParaVenda ? styles.statusAtivo : styles.statusInativo),
                            ...(isDark ? styles.statusBadgeDark : {}),
                          }}
                        >
                          {produto.ativoParaVenda ? "Disponível para venda" : "Desativado para venda"}
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

                      <div style={styles.controlBox}>
                        <button
                          type="button"
                          style={{ ...styles.circleButton, ...(isDark ? styles.circleButtonDark : {}) }}
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
                          style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                        />

                        <button
                          type="button"
                          style={{ ...styles.circleButton, ...(isDark ? styles.circleButtonDark : {}) }}
                          onClick={() => ajustarEstoque("mais", produto.id)}
                          aria-label={`Aumentar estoque de ${produto.nome}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => alternarDisponibilidade(produto.id)}
                        style={{ ...styles.toggleButton, ...(isDark ? styles.toggleButtonDark : {}) }}
                      >
                        {produto.ativoParaVenda ? "Desativar para venda" : "Ativar para venda"}
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
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#f3f5f9" },
  layoutDark: { backgroundColor: "#0f172a" },
  page: { marginLeft: "256px", width: "calc(100% - 256px)", padding: "32px", boxSizing: "border-box" },
  pageDark: { backgroundColor: "#111827", color: "#f3f4f6" },
  header: { marginBottom: "24px" },
  title: { margin: 0, fontSize: "32px", color: "#111c2d", fontWeight: 700 },
  titleDark: { color: "#f9fafb" },
  subtitle: { margin: "8px 0 0", color: "#4a5568" },
  subtitleDark: { color: "#d1d5db" },
  emptyState: { backgroundColor: "#ffffff", color: "#475569", borderRadius: "10px", padding: "18px", border: "1px solid #e2e8f0" },
  emptyStateDark: { backgroundColor: "#1f2937", color: "#e5e7eb", borderColor: "#374151" },
  emptyStateError: { backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "10px", padding: "18px", border: "1px solid #fecaca" },
  emptyStateErrorDark: { backgroundColor: "#3f1721", color: "#fecdd3", borderColor: "#7f1d1d" },
  listContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  cardDark: { backgroundColor: "#111827", borderColor: "#374151" },
  productContent: { display: "flex", gap: "16px" },
  imageBox: { width: "120px", height: "120px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  productImage: { width: "100%", height: "100%", objectFit: "cover" },
  infoArea: { flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
  badgeRow: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
  badge: { backgroundColor: "#e2e8f0", color: "#0f172a", borderRadius: "999px", padding: "4px 8px", fontSize: "12px" },
  badgeDark: { backgroundColor: "#334155", color: "#e2e8f0" },
  statusBadge: { borderRadius: "999px", padding: "4px 8px", fontSize: "12px", fontWeight: 600 },
  statusBadgeDark: { opacity: 1 },
  statusAtivo: { backgroundColor: "#dcfce7", color: "#166534" },
  statusInativo: { backgroundColor: "#fee2e2", color: "#991b1b" },
  validadeBadge: { borderRadius: "999px", padding: "4px 8px", fontSize: "12px", fontWeight: 600 },
  validadeBadgeDark: { opacity: 1 },
  validadeBadgeValido: { backgroundColor: "#e0f2fe", color: "#075985" },
  validadeBadgeVencido: { backgroundColor: "#fef3c7", color: "#92400e" },
  productName: { margin: 0, color: "#111c2d", fontSize: "20px" },
  productNameDark: { color: "#f9fafb" },
  fornecedorName: { color: "#64748b", fontSize: "13px" },
  fornecedorNameDark: { color: "#d1d5db" },
  stockSummary: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "8px 0" },
  label: { color: "#475569", fontSize: "12px" },
  labelDark: { color: "#d1d5db" },
  stockValue: { color: "#111827", fontSize: "16px" },
  stockValueDark: { color: "#f9fafb" },
  priceSummary: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "0 0 8px" },
  priceValue: { color: "#111827", fontSize: "15px" },
  priceValueDark: { color: "#f9fafb" },
  vencimentoSummary: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "0 0 8px" },
  vencimentoValue: { color: "#111827", fontSize: "15px" },
  vencimentoValueDark: { color: "#f9fafb" },
  controlBox: { display: "flex", alignItems: "center", gap: "8px" },
  circleButton: { width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#111827", cursor: "pointer", fontSize: "20px" },
  circleButtonDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
  input: { width: "90px", textAlign: "center", borderRadius: "8px", border: "1px solid #d7dfeb", padding: "8px 10px", backgroundColor: "#ffffff", color: "#111827" },
  inputDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
  toggleButton: { border: "1px solid #d1d5db", backgroundColor: "#ffffff", color: "#111827", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" },
  toggleButtonDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
};