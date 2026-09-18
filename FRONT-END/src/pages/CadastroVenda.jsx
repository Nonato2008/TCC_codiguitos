import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import PrimaryButton from "../components/PrimaryButton";
import { codiguitos_api } from "../services/tcc.api";
import { buscarProdutos } from "../services/produtosService";
import { ThemeContext } from "../contexts/ThemeContext";

const itemVazio = {
  idProduto: "",
  quantidade: "1",
  valorUnitario: "0.00",
  valorTotal: "0.00",
};

const estadoInicial = {
  idProprietario: "",
  idVendedor: "",
  observacoes: "",
};

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

// ---------- Normaliza retorno: array direto ou { result: [...] } ----------
function normalizarLista(lista) {
  if (Array.isArray(lista)) return lista;
  if (Array.isArray(lista?.result)) return lista.result;
  if (Array.isArray(lista?.data)) return lista.data;
  return [];
}

export default function CadastroVendas() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [form, setForm] = useState(estadoInicial);
  const [itens, setItens] = useState([{ ...itemVazio }]);

  const [produtos, setProdutos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);

  const [buscaProduto, setBuscaProduto] = useState("");

  const [loading, setLoading] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [carregandoVendedores, setCarregandoVendedores] = useState(false);
  const [carregandoProprietarios, setCarregandoProprietarios] = useState(false);
  const [mensagem, setMensagem] = useState({ type: "", text: "" });

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

  // ---------- Campos do formulário ----------
  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  // ---------- Manipulação dos itens ----------
  function atualizarItem(index, campo, valor) {
    // Verifica duplicidade ao trocar o produto
    if (campo === "idProduto" && valor) {
      const jaExiste = itens.some(
        (item, i) =>
          i !== index && Number(item.idProduto) === Number(valor)
      );

      if (jaExiste) {
        setMensagem({
          type: "error",
          text: "Esse produto já foi adicionado à venda.",
        });
        return;
      }
    }

    setItens((anterior) => {
      const novos = [...anterior];
      const item = { ...novos[index], [campo]: valor };

      if (campo === "idProduto" || campo === "quantidade") {
        const produto = produtos.find(
          (p) => Number(getIdProduto(p)) === Number(item.idProduto)
        );

        if (produto) {
          const preco = getPrecoProduto(produto);
          const estoque = getEstoqueProduto(produto);

          let qtd = Number(item.quantidade) || 0;
          if (qtd > estoque) qtd = estoque;
          if (qtd < 1 && estoque >= 1) qtd = 1;

          item.quantidade = String(qtd);
          item.valorUnitario = preco.toFixed(2);
          item.valorTotal = (preco * qtd).toFixed(2);
        } else {
          item.valorUnitario = "0.00";
          item.valorTotal = "0.00";
        }
      }

      novos[index] = item;
      return novos;
    });
  }

  // ---------- Adicionar item ----------
  function adicionarItem() {
    setItens((anterior) => [...anterior, { ...itemVazio }]);
    carregarProdutos();
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

  // ---------- Produtos filtrados pela busca ----------
  const produtosFiltrados = produtos.filter((produto) => {
    const termo = buscaProduto.trim().toLowerCase();
    if (!termo) return true;
    const nome = getNomeProduto(produto).toLowerCase();
    const id = String(getIdProduto(produto));
    return nome.includes(termo) || id.includes(termo);
  });

  // ---------- Submit ----------
  async function cadastrarVenda(event) {
    event.preventDefault();

    if (!form.idProprietario) {
      setMensagem({ type: "error", text: "Selecione um proprietário." });
      return;
    }

    if (!form.idVendedor) {
      setMensagem({ type: "error", text: "Selecione um vendedor." });
      return;
    }

    const itensValidos = itens.filter(
      (i) => i.idProduto && Number(i.quantidade) > 0
    );
    if (itensValidos.length === 0) {
      setMensagem({
        type: "error",
        text: "Adicione pelo menos um produto válido.",
      });
      return;
    }

    // Valida produtos duplicados
    const idsUsados = new Set();
    for (const item of itensValidos) {
      const id = Number(item.idProduto);
      if (idsUsados.has(id)) {
        const produto = produtos.find(
          (p) => Number(getIdProduto(p)) === id
        );
        setMensagem({
          type: "error",
          text: `O produto "${getNomeProduto(
            produto
          )}" está duplicado. Remova uma das linhas.`,
        });
        return;
      }
      idsUsados.add(id);
    }

    // Valida estoque
    for (const item of itensValidos) {
      const produto = produtos.find(
        (p) => Number(getIdProduto(p)) === Number(item.idProduto)
      );
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
        observacoes: form.observacoes?.trim() || "",
        valorTotal: Number(totalGeral.toFixed(2)),
        itens: itensValidos.map((i) => ({
          idProduto: Number(i.idProduto),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.valorUnitario),
          valorTotal: Number(i.valorTotal),
        })),
      };

      await codiguitos_api.post("/vendas", dados, {
        headers: { "Content-Type": "application/json" },
      });

      setMensagem({ type: "success", text: "Venda registrada com sucesso!" });
      setForm(estadoInicial);
      setItens([{ ...itemVazio }]);
      setBuscaProduto("");
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
            {/* ---------- Proprietário + Vendedor (linha) ---------- */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label
                  style={{
                    ...styles.label,
                    ...(isDark ? styles.labelDark : {}),
                  }}
                >
                  Proprietário
                </label>
                <select
                  name="idProprietario"
                  value={form.idProprietario}
                  onChange={atualizarCampo}
                  style={{
                    ...styles.select,
                    ...(isDark ? styles.selectDark : {}),
                  }}
                  disabled={carregandoProprietarios}
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
                </select>
              </div>

              <div style={styles.field}>
                <label
                  style={{
                    ...styles.label,
                    ...(isDark ? styles.labelDark : {}),
                  }}
                >
                  Vendedor
                </label>
                <select
                  name="idVendedor"
                  value={form.idVendedor}
                  onChange={atualizarCampo}
                  style={{
                    ...styles.select,
                    ...(isDark ? styles.selectDark : {}),
                  }}
                  disabled={carregandoVendedores}
                >
                  <option value="">
                    {carregandoVendedores
                      ? "Carregando vendedores..."
                      : "Selecione um vendedor..."}
                  </option>
                  {vendedores.map((vendedor) => {
                    const id = vendedor.Id ?? vendedor.id;
                    const nome =
                      vendedor.Nome ?? vendedor.nome ?? "Sem nome";
                    return (
                      <option key={id} value={id}>
                        {nome}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* ---------- Lista de produtos ---------- */}
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

                <div style={styles.headerButtons}>
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
                  <button
                    type="button"
                    style={{
                      ...styles.addButton,
                      ...(isDark ? styles.addButtonDark : {}),
                    }}
                    onClick={adicionarItem}
                  >
                    + Adicionar produto
                  </button>
                </div>
              </div>

              {/* ---------- Campo de busca ---------- */}
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
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  placeholder="Pesquisar produto por nome ou ID..."
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
                    onClick={() => setBuscaProduto("")}
                    title="Limpar pesquisa"
                  >
                    ✕
                  </button>
                )}
              </div>

              {buscaProduto.trim() && (
                <p
                  style={{
                    ...styles.searchInfo,
                    ...(isDark ? styles.searchInfoDark : {}),
                  }}
                >
                  {produtosFiltrados.length} produto(s) encontrado(s) para "
                  {buscaProduto}"
                </p>
              )}

              {/* ---------- Cabeçalho das colunas ---------- */}
              <div style={styles.itemHeaderRow}>
                <span
                  style={{
                    ...styles.itemHeaderLabel,
                    ...(isDark ? styles.itemHeaderLabelDark : {}),
                  }}
                >
                  Produto
                </span>
                <span
                  style={{
                    ...styles.itemHeaderLabel,
                    ...(isDark ? styles.itemHeaderLabelDark : {}),
                  }}
                >
                  Qtd
                </span>
                <span
                  style={{
                    ...styles.itemHeaderLabel,
                    ...(isDark ? styles.itemHeaderLabelDark : {}),
                  }}
                >
                  Total
                </span>
                <span />
              </div>

              {itens.map((item, index) => {
                const produtoAtual = produtos.find(
                  (p) => Number(getIdProduto(p)) === Number(item.idProduto)
                );
                const estoqueAtual = produtoAtual
                  ? getEstoqueProduto(produtoAtual)
                  : undefined;
                const noLimite =
                  estoqueAtual !== undefined &&
                  Number(item.quantidade) >= estoqueAtual;

                // Produtos já usados em OUTRAS linhas
                const idsUsadosEmOutrasLinhas = itens
                  .filter((_, i) => i !== index)
                  .map((i) => Number(i.idProduto))
                  .filter((v) => !Number.isNaN(v) && v > 0);

                // Produtos disponíveis para ESTA linha
                const produtosParaSelect = [...produtosFiltrados];

                // Mantém o produto selecionado visível mesmo que filtrado
                if (
                  produtoAtual &&
                  !produtosParaSelect.some(
                    (p) =>
                      Number(getIdProduto(p)) === Number(item.idProduto)
                  )
                ) {
                  produtosParaSelect.unshift(produtoAtual);
                }

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.itemCard,
                      ...(isDark ? styles.itemCardDark : {}),
                    }}
                  >
                    <div style={styles.itemRow}>
                      <select
                        value={item.idProduto}
                        onChange={(e) =>
                          atualizarItem(index, "idProduto", e.target.value)
                        }
                        style={{
                          ...styles.select,
                          ...(isDark ? styles.selectDark : {}),
                        }}
                      >
                        <option value="">
                          {carregandoProdutos && produtos.length === 0
                            ? "Carregando produtos..."
                            : produtos.length === 0
                            ? "Nenhum produto cadastrado"
                            : produtosParaSelect.length === 0
                            ? "Nenhum produto encontrado"
                            : "Selecione um produto..."}
                        </option>
                        {produtosParaSelect.map((produto) => {
                          const id = getIdProduto(produto);
                          const nome = getNomeProduto(produto);
                          const preco = getPrecoProduto(produto);
                          const estoque = getEstoqueProduto(produto);
                          const semEstoque = estoque <= 0;
                          const jaUsadoEmOutra =
                            idsUsadosEmOutrasLinhas.includes(Number(id));

                          return (
                            <option
                              key={id}
                              value={id}
                              disabled={semEstoque || jaUsadoEmOutra}
                            >
                              {nome} - R$ {preco.toFixed(2)}
                              {jaUsadoEmOutra
                                ? " (já adicionado)"
                                : semEstoque
                                ? " (sem estoque)"
                                : ` • Estoque: ${estoque}`}
                            </option>
                          );
                        })}
                      </select>

                      <input
                        type="number"
                        min="1"
                        max={estoqueAtual ?? undefined}
                        step="1"
                        value={item.quantidade}
                        onChange={(e) =>
                          atualizarItem(index, "quantidade", e.target.value)
                        }
                        style={{
                          ...styles.input,
                          ...(isDark ? styles.inputDark : {}),
                          width: "90px",
                          textAlign: "center",
                          borderColor: noLimite
                            ? "#f59e0b"
                            : isDark
                            ? "#4b5563"
                            : "#cbd5e1",
                        }}
                        placeholder="Qtd"
                        title={
                          estoqueAtual !== undefined
                            ? `Máximo disponível: ${estoqueAtual}`
                            : undefined
                        }
                      />

                      <input
                        type="text"
                        value={`R$ ${Number(item.valorTotal).toFixed(2)}`}
                        readOnly
                        style={{
                          ...styles.input,
                          ...(isDark ? styles.inputDark : {}),
                          width: "130px",
                          textAlign: "right",
                          background: isDark ? "#0b1220" : "#f1f5f9",
                        }}
                      />

                      {itens.length > 1 ? (
                        <button
                          type="button"
                          style={{
                            ...styles.removeButton,
                            ...(isDark ? styles.removeButtonDark : {}),
                          }}
                          onClick={() => removerItem(index)}
                          title="Remover produto"
                        >
                          ✕
                        </button>
                      ) : (
                        <span style={styles.removePlaceholder} />
                      )}
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  ...styles.totalBox,
                  ...(isDark ? styles.totalBoxDark : {}),
                }}
              >
                <span
                  style={{
                    ...styles.totalLabel,
                    ...(isDark ? styles.totalLabelDark : {}),
                  }}
                >
                  Total da venda
                </span>
                <strong
                  style={{
                    ...styles.totalValue,
                    ...(isDark ? styles.totalValueDark : {}),
                  }}
                >
                  R$ {totalGeral.toFixed(2)}
                </strong>
              </div>
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
        </section>
      </main>
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
    gridTemplateColumns: "1fr 1fr",
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
  input: {
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
  },
  inputDark: {
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
  headerButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
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
  addButton: {
    border: "1px dashed #303e51",
    backgroundColor: "#fff",
    color: "#303e51",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
  addButtonDark: {
    borderColor: "#94a3b8",
    backgroundColor: "#1f2937",
    color: "#f9fafb",
  },

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
  searchInfo: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
    fontStyle: "italic",
  },
  searchInfoDark: { color: "#94a3b8" },

  // ---------- Cabeçalho das colunas ----------
  itemHeaderRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 90px 130px 42px",
    gap: "10px",
    padding: "0 8px",
    alignItems: "center",
  },
  itemHeaderLabel: {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#64748b",
  },
  itemHeaderLabelDark: { color: "#94a3b8" },

  itemCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px",
    backgroundColor: "#f8fafc",
  },
  itemCardDark: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 90px 130px 42px",
    gap: "10px",
    alignItems: "center",
  },
  removeButton: {
    border: "1px solid #fecaca",
    backgroundColor: "#fff",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  removeButtonDark: {
    backgroundColor: "#3f1721",
    borderColor: "#7f1d1d",
    color: "#fecdd3",
  },
  removePlaceholder: { width: "42px", height: "38px" },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#f1f5f9",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  totalBoxDark: {
    backgroundColor: "#0b1220",
    borderColor: "#334155",
  },
  totalLabel: { color: "#303e51", fontWeight: 600, fontSize: "14px" },
  totalLabelDark: { color: "#cbd5e1" },
  totalValue: { color: "#111c2d", fontSize: "20px" },
  totalValueDark: { color: "#f9fafb" },
};