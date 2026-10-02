import { useEffect, useMemo, useState, useContext } from "react";
import {
  ArrowDownUp,
  ImagePlus,
  Minus,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";
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

  const dataTexto = String(dataVencimento);
  const partes = dataTexto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const data = partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(dataVencimento);
  if (Number.isNaN(data.getTime())) {
    return { texto: "Na validade", tipo: "valid" };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (data < hoje) return { texto: "Vencido", tipo: "expired" };

  const diasAteVencer = Math.ceil((data - hoje) / 86400000);
  if (diasAteVencer <= 30) {
    return { texto: `Vence em ${diasAteVencer} ${diasAteVencer === 1 ? "dia" : "dias"}`, tipo: "soon" };
  }

  return { texto: "Na validade", tipo: "valid" };
}

function normalizarLista(lista) {
  if (Array.isArray(lista)) return lista;
  if (Array.isArray(lista?.result)) return lista.result;
  if (Array.isArray(lista?.data)) return lista.data;
  return [];
}

function formatarDataInput(valor) {
  if (!valor) return "";
  const datePart = String(valor).match(/^(\d{4}-\d{2}-\d{2})/);
  if (datePart) return datePart[1];
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function formatarDataExibicao(valor) {
  const data = formatarDataInput(valor);
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

export default function GerenciamentoEstoque() {

  // Hooks que carregam produtos e fornecedores da API
  const { produtos, loading, error } = useProdutos();
  const { fornecedores } = useFornecedores();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Lista local de produtos (permite ajustes otimistas sem refetch)
  const [listaProdutos, setListaProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [salvandoId, setSalvandoId] = useState(null);
  const [mensagemEstoque, setMensagemEstoque] = useState("");
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [edicao, setEdicao] = useState({ nome: "", preco: "", dataVenc: "", imagem: null });
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

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
        const statusProduto = String(produto.Status ?? produto.status ?? "").toLowerCase();
        const statusDisponivel = !["esgotado", "vencido", "indisponível", "indisponivel"].includes(statusProduto);

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
            produto.ativoParaVenda ?? (quantidadeAtual > 0 && statusDisponivel),
          imagemOriginal,
          imagem: quantidadeAtual === 0 ? "esgotado.jpg" : imagemOriginal,
        };
      })
    );
  }, [produtos]);

  const produtosVisiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const filtrados = listaProdutos.filter((produto) => {
      const validade = getStatusValidade(produto);
      const correspondeBusca = !termo || [
        produto.nome,
        produto.id,
        getFornecedorNome(produto),
      ].some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo));

      if (!correspondeBusca) return false;
      if (filtro === "semEstoque") return produto.quantidade <= 0;
      if (filtro === "proximos") return validade.tipo === "soon";
      if (filtro === "vencidos") return validade.tipo === "expired";
      if (filtro === "disponiveis") return produto.ativoParaVenda && produto.quantidade > 0 && validade.tipo !== "expired";
      if (filtro === "indisponiveis") return !produto.ativoParaVenda || produto.quantidade <= 0 || validade.tipo === "expired";
      return true;
    });

    return filtrados.sort((a, b) => {
      if (ordenacao === "estoque") return a.quantidade - b.quantidade;
      if (ordenacao === "validade") {
        const dataA = new Date(a.DataVenc ?? a.dataVenc ?? "9999-12-31").getTime();
        const dataB = new Date(b.DataVenc ?? b.dataVenc ?? "9999-12-31").getTime();
        return dataA - dataB;
      }
      return String(a.nome).localeCompare(String(b.nome), "pt-BR");
    });
  }, [listaProdutos, busca, filtro, ordenacao, fornecedores]);

  const totaisEstoque = useMemo(() => ({
    todos: listaProdutos.length,
    semEstoque: listaProdutos.filter((produto) => produto.quantidade <= 0).length,
    proximos: listaProdutos.filter((produto) => getStatusValidade(produto).tipo === "soon").length,
    disponiveis: listaProdutos.filter((produto) => produto.ativoParaVenda && produto.quantidade > 0).length,
    indisponiveis: listaProdutos.filter((produto) => !produto.ativoParaVenda || produto.quantidade <= 0).length,
  }), [listaProdutos]);

  function abrirEdicao(produto) {
    setProdutoEmEdicao(produto);
    setEdicao({
      nome: produto.Nome ?? produto.nome ?? "",
      preco: String(produto.Preco ?? produto.preco ?? ""),
      dataVenc: formatarDataInput(produto.DataVenc ?? produto.dataVenc),
      imagem: null,
    });
  }

  async function salvarEdicao(event) {
    event.preventDefault();
    if (!produtoEmEdicao || !edicao.nome.trim() || Number(edicao.preco) <= 0 || !edicao.dataVenc) return;

    setSalvandoEdicao(true);
    try {
      await atualizarProduto(produtoEmEdicao.id, {
        idFornecedor: produtoEmEdicao.IdFornecedor ?? produtoEmEdicao.idFornecedor ?? 1,
        nome: edicao.nome.trim(),
        preco: Number(edicao.preco),
        quantidade: produtoEmEdicao.quantidade,
        dataVenc: edicao.dataVenc,
        imagem: edicao.imagem,
      });

      const produtosAtualizados = await buscarProdutos();
      const produtoAtualizado = normalizarLista(produtosAtualizados).find(
        (produto) => String(produto.Id ?? produto.id) === String(produtoEmEdicao.id)
      );

      if (produtoAtualizado) {
        setListaProdutos((atual) => atual.map((produto) => produto.id === produtoEmEdicao.id
          ? { ...produto, ...produtoAtualizado, nome: produtoAtualizado.Nome ?? produtoAtualizado.nome, quantidade: Number(produtoAtualizado.Quantidade ?? produtoAtualizado.quantidade ?? produto.quantidade), quantidadeAjuste: 0, imagemOriginal: getImagemProduto(produtoAtualizado.Imagem ?? produtoAtualizado.imagem), imagem: getImagemProduto(produtoAtualizado.Imagem ?? produtoAtualizado.imagem) }
          : produto));
      }

      setMensagemEstoque(`${edicao.nome.trim()} atualizado com sucesso.`);
      setProdutoEmEdicao(null);
    } catch (err) {
      setMensagemEstoque(formatErrorMessage(err, "Não foi possível editar o produto."));
    } finally {
      setSalvandoEdicao(false);
    }
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
  function alterarAjuste(idProduto, diferenca) {
    setMensagemEstoque("");
    setListaProdutos((atual) => atual.map((produto) => {
      if (produto.id !== idProduto) return produto;
      const ajusteAtual = Number(produto.quantidadeAjuste ?? 0);
      const proximoAjuste = ajusteAtual + diferenca;
      const limiteInferior = -produto.quantidade;
      const limiteSuperior = 999999 - produto.quantidade;
      return {
        ...produto,
        quantidadeAjuste: Math.max(limiteInferior, Math.min(limiteSuperior, proximoAjuste)),
      };
    }));
  }

  async function confirmarAjuste(idProduto) {
    const produtoAtual = listaProdutos.find((produto) => produto.id === idProduto);
    const ajuste = Number(produtoAtual?.quantidadeAjuste ?? 0);
    if (!produtoAtual || !Number.isInteger(ajuste) || ajuste === 0) return;

    const quantidadeAnterior = produtoAtual.quantidade;
    const novaQuantidade = quantidadeAnterior + ajuste;
    if (novaQuantidade < 0) return;

    setSalvandoId(idProduto);
    setMensagemEstoque("");
    try {
      await salvarProdutoNoBanco(idProduto, novaQuantidade);
      setListaProdutos((atual) => atual.map((produto) => {
        if (produto.id !== idProduto) return produto;
        const imagemOriginal = produto.imagemOriginal ?? produto.imagem ?? "/example.jpg";
        return {
          ...produto,
          quantidade: novaQuantidade,
          quantidadeAjuste: 0,
          Status: novaQuantidade <= 0 ? "Esgotado" : getStatusValidade(produto).tipo === "expired" ? "Vencido" : "Em Estoque",
          ativoParaVenda: novaQuantidade > 0 && produto.ativoParaVenda,
          imagem: novaQuantidade === 0 ? "esgotado.jpg" : imagemOriginal,
        };
      }));
      setMensagemEstoque(`Estoque de ${produtoAtual.nome} atualizado para ${novaQuantidade} ${novaQuantidade === 1 ? "unidade" : "unidades"}.`);
    } catch (err) {
      console.error(err);
      setMensagemEstoque(formatErrorMessage(err, "Falha ao atualizar o estoque no banco de dados."));
    } finally {
      setSalvandoId(null);
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

      <main className="inventory-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        <header className="inventory-header" style={styles.header}>
          <div>
            <span className="inventory-eyebrow">Operação da loja</span>
            <h1>Gerenciamento de estoque</h1>
            <p>Encontre produtos e ajuste quantidades com segurança.</p>
          </div>
          <span className="inventory-total-pill">{listaProdutos.length} produtos</span>
        </header>

        <section className="inventory-toolbar" aria-label="Buscar e filtrar estoque">
          <label className="inventory-search">
            <Search size={18} aria-hidden="true" />
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por produto, código ou fornecedor" aria-label="Buscar produtos" />
            {busca && <button type="button" aria-label="Limpar busca" onClick={() => setBusca("")}><X size={15} /></button>}
          </label>
          <div className="inventory-filter-chips" role="group" aria-label="Filtros rápidos">
            {[
              ["todos", "Todos", totaisEstoque.todos],
              ["semEstoque", "Sem estoque", totaisEstoque.semEstoque],
              ["proximos", "Próximos do vencimento", totaisEstoque.proximos],
              ["disponiveis", "Disponíveis", totaisEstoque.disponiveis],
              ["indisponiveis", "Indisponíveis", totaisEstoque.indisponiveis],
            ].map(([valor, rotulo, total]) => (
              <button key={valor} type="button" className={filtro === valor ? "is-active" : ""} aria-pressed={filtro === valor} onClick={() => setFiltro(valor)}>
                {rotulo}<span>{total}</span>
              </button>
            ))}
          </div>
          <label className="inventory-sort">
            <ArrowDownUp size={16} aria-hidden="true" />
            <span>Ordenar</span>
            <select value={ordenacao} onChange={(event) => setOrdenacao(event.target.value)} aria-label="Ordenar produtos">
              <option value="nome">Nome</option>
              <option value="estoque">Estoque</option>
              <option value="validade">Validade</option>
            </select>
          </label>
        </section>

        {mensagemEstoque && <p className="inventory-feedback" role="status">{mensagemEstoque}</p>}

        {loading && <div style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>Carregando produtos...</div>}

        {!loading && error && <div style={{ ...styles.emptyStateError, ...(isDark ? styles.emptyStateErrorDark : {}) }}>{error}</div>}

        {!loading && !error && listaProdutos.length === 0 && (
          <div className="inventory-empty" style={{ ...styles.emptyState, ...(isDark ? styles.emptyStateDark : {}) }}>Nenhum produto cadastrado.</div>
        )}

        {!loading && !error && listaProdutos.length > 0 && produtosVisiveis.length === 0 && (
          <div className="inventory-empty"><PackageX size={27} aria-hidden="true" /><strong>Nenhum produto encontrado</strong><span>Altere os filtros ou a busca.</span></div>
        )}

        {!loading && !error && produtosVisiveis.length > 0 && (
          <div className="inventory-list" style={styles.listContainer}>
            {produtosVisiveis.map((produto) => {
              const validade = getStatusValidade(produto);

              return (
                <section key={String(produto.id)} className="inventory-card" style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>
                  <div style={styles.productContent}>
                    <div style={styles.imageBox}>
                      <img src={produto.imagem} alt={produto.nome} style={styles.productImage} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    </div>

                    <div style={styles.infoArea}>
                      <div style={styles.badgeRow}>
                        <span style={{ ...styles.badge, ...(isDark ? styles.badgeDark : {}) }}>{produto.categoria || "Produto"}</span>
                        <span className={`inventory-status-badge${produto.ativoParaVenda ? " is-available" : " is-unavailable"}`}
                          style={{
                            ...styles.statusBadge,
                            ...(produto.ativoParaVenda ? styles.statusAtivo : styles.statusInativo),
                            ...(isDark ? styles.statusBadgeDark : {}),
                          }}
                        >
                          {produto.ativoParaVenda ? "Disponível para venda" : "Desativado para venda"}
                        </span>
                        <span className={`inventory-expiry-badge inventory-expiry-badge--${validade.tipo}`}
                          style={{
                            ...styles.validadeBadge,
                            ...(validade.tipo === "expired" ? styles.validadeBadgeVencido : styles.validadeBadgeValido),
                            ...(isDark ? styles.validadeBadgeDark : {}),
                          }}
                        >
                          {validade.texto}
                        </span>
                      </div>

                      <div className="inventory-product-title-row">
                        <h3 style={{ ...styles.productName, ...(isDark ? styles.productNameDark : {}) }}>{produto.nome}</h3>
                        <button type="button" className="inventory-edit-button" onClick={() => abrirEdicao(produto)} aria-label={`Editar ${produto.nome}`}>
                          <Pencil size={15} aria-hidden="true" /><span>Editar produto</span>
                        </button>
                      </div>
                      <div style={{ ...styles.fornecedorName, ...(isDark ? styles.fornecedorNameDark : {}) }}>{getFornecedorNome(produto)}</div>

                      <div className="inventory-facts">
                        <div className="inventory-stock-current">
                          <span>Estoque atual</span>
                          <strong>{produto.quantidade}<small>{produto.quantidade === 1 ? "unidade" : "unidades"}</small></strong>
                        </div>
                        <div><span>Preço unitário</span><strong>{Number(produto.Preco ?? produto.preco ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></div>
                        <div><span>Validade</span><strong>{formatarDataExibicao(produto.DataVenc ?? produto.dataVenc)}</strong></div>
                        <div><span>Entrada</span><strong>{formatarDataExibicao(produto.DataCad ?? produto.dataCad)}</strong></div>
                      </div>

                      <div className="inventory-adjustment">
                        <div className="inventory-adjustment-copy">
                          <strong>Ajuste de estoque</strong>
                          <span>Defina a variação e confirme para salvar.</span>
                        </div>
                        <div className="inventory-adjustment-stepper" aria-label={`Ajustar estoque de ${produto.nome}`}>
                        <button
                          type="button"
                          className="inventory-step-button"
                          disabled={Number(produto.quantidadeAjuste) <= -produto.quantidade}
                          onClick={() => alterarAjuste(produto.id, -1)}
                          aria-label={`Planejar retirada de uma unidade de ${produto.nome}`}
                        >
                          <Minus size={15} aria-hidden="true" />
                        </button>
                        <output aria-live="polite" className={produto.quantidadeAjuste > 0 ? "is-positive" : produto.quantidadeAjuste < 0 ? "is-negative" : ""}>
                          {produto.quantidadeAjuste > 0 ? "+" : ""}{produto.quantidadeAjuste}
                        </output>
                        <button
                          type="button"
                          className="inventory-step-button"
                          disabled={produto.quantidade + Number(produto.quantidadeAjuste) >= 999999}
                          onClick={() => alterarAjuste(produto.id, 1)}
                          aria-label={`Planejar entrada de uma unidade de ${produto.nome}`}
                        >
                          <Plus size={15} aria-hidden="true" />
                        </button>
                      </div>

                        <div className="inventory-adjustment-result">
                          <span>Novo estoque</span>
                          <strong>{produto.quantidade + Number(produto.quantidadeAjuste)} {produto.quantidade + Number(produto.quantidadeAjuste) === 1 ? "unidade" : "unidades"}</strong>
                        </div>

                        <button type="button" className="inventory-save-adjustment" disabled={Number(produto.quantidadeAjuste) === 0 || salvandoId === produto.id} onClick={() => confirmarAjuste(produto.id)}>
                          {salvandoId === produto.id ? <RefreshCw className="is-spinning" size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                          {salvandoId === produto.id ? "Salvando..." : "Confirmar ajuste"}
                        </button>
                      </div>

                      <div className="inventory-card-actions">
                        <button type="button" className="inventory-availability-toggle" aria-pressed={!produto.ativoParaVenda} onClick={() => alternarDisponibilidade(produto.id)}>
                          {produto.ativoParaVenda ? "Marcar indisponível" : "Liberar para venda"}
                        </button>
                        <span className="inventory-local-note">Disponibilidade local</span>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {produtoEmEdicao && (
          <div className="inventory-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !salvandoEdicao) setProdutoEmEdicao(null); }}>
            <section className="inventory-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="inventory-edit-title">
              <header>
                <div><span>Cadastro do produto</span><h2 id="inventory-edit-title">Editar produto</h2></div>
                <button type="button" aria-label="Fechar edição" disabled={salvandoEdicao} onClick={() => setProdutoEmEdicao(null)}><X size={19} /></button>
              </header>
              <form onSubmit={salvarEdicao}>
                <label><span>Nome</span><input required minLength="3" maxLength="45" value={edicao.nome} onChange={(event) => setEdicao((atual) => ({ ...atual, nome: event.target.value }))} /></label>
                <div className="inventory-edit-grid">
                  <label><span>Preço unitário</span><input required type="number" min="0.01" step="0.01" value={edicao.preco} onChange={(event) => setEdicao((atual) => ({ ...atual, preco: event.target.value }))} /></label>
                  <label><span>Validade</span><input required type="date" value={edicao.dataVenc} onChange={(event) => setEdicao((atual) => ({ ...atual, dataVenc: event.target.value }))} /></label>
                </div>
                <label className="inventory-edit-image"><span>Imagem do produto <small>(opcional)</small></span><input type="file" accept="image/*" onChange={(event) => setEdicao((atual) => ({ ...atual, imagem: event.target.files?.[0] ?? null }))} /><ImagePlus size={18} aria-hidden="true" /></label>
                {edicao.imagem && <span className="inventory-selected-file">{edicao.imagem.name}</span>}
                <div className="inventory-edit-actions">
                  <button type="button" className="inventory-edit-cancel" disabled={salvandoEdicao} onClick={() => setProdutoEmEdicao(null)}>Cancelar</button>
                  <button type="submit" className="inventory-edit-save" disabled={salvandoEdicao || !edicao.nome.trim() || Number(edicao.preco) <= 0 || !edicao.dataVenc}>
                    {salvandoEdicao ? <RefreshCw className="is-spinning" size={16} /> : <Save size={16} />}
                    {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </form>
            </section>
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