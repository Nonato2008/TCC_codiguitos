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
      0,
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
      0,
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

  const STORAGE_KEY = "ultimaVenda";

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

  // Restaurar últimos dados salvos (se houver)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form) setForm(parsed.form);
      if (Array.isArray(parsed?.itens) && parsed.itens.length > 0)
        setItens(parsed.itens);
      if (parsed?.buscaProduto) setBuscaProduto(parsed.buscaProduto);
    } catch (err) {
      console.warn("Erro ao restaurar última venda:", err);
    }
  }, []);

  // Salvar automaticamente última venda no localStorage
  useEffect(() => {
    try {
      const payload = { form, itens, buscaProduto };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Erro ao salvar última venda:", err);
    }
  }, [form, itens, buscaProduto]);

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
        (item, i) => i !== index && Number(item.idProduto) === Number(valor),
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
          (p) => Number(getIdProduto(p)) === Number(item.idProduto),
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
    0,
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
      (i) => i.idProduto && Number(i.quantidade) > 0,
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
        const produto = produtos.find((p) => Number(getIdProduto(p)) === id);
        setMensagem({
          type: "error",
          text: `O produto "${getNomeProduto(
            produto,
          )}" está duplicado. Remova uma das linhas.`,
        });
        return;
      }
      idsUsados.add(id);
    }

    // Valida estoque
    for (const item of itensValidos) {
      const produto = produtos.find(
        (p) => Number(getIdProduto(p)) === Number(item.idProduto),
      );
      const estoque = produto ? getEstoqueProduto(produto) : 0;

      if (Number(item.quantidade) > estoque) {
        setMensagem({
          type: "error",
          text: `A quantidade do produto "${getNomeProduto(
            produto,
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
      // Mantemos os dados preenchidos (persistidos em localStorage) para reutilização
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
            <h1
              style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}
            >
              Cadastro de venda
            </h1>
            <p
              style={{
                ...styles.subtitle,
                ...(isDark ? styles.subtitleDark : {}),
              }}
            >
              Registre uma nova venda com produtos, vendedor e proprietário.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/vendas")}
            style={{
              ...styles.backButton,
              ...(isDark ? styles.backButtonDark : {}),
            }}
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
            <div style={styles.grid}>
              <label
                style={{ ...styles.field, ...(isDark ? styles.fieldDark : {}) }}
              >
                <span
                  style={{
                    ...styles.label,
                    ...(isDark ? styles.labelDark : {}),
                  }}
                >
                  Proprietário
                </span>
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
                  <option value="">Selecione</option>
                  {proprietarios.map((proprietario) => (
                    <option
                      key={proprietario.Id ?? proprietario.id}
                      value={proprietario.Id ?? proprietario.id}
                    >
                      {proprietario.Nome ?? proprietario.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{ ...styles.field, ...(isDark ? styles.fieldDark : {}) }}
              >
                <span
                  style={{
                    ...styles.label,
                    ...(isDark ? styles.labelDark : {}),
                  }}
                >
                  Vendedor
                </span>
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
                  <option value="">Selecione</option>
                  {vendedores.map((vendedor) => (
                    <option
                      key={vendedor.Id ?? vendedor.id}
                      value={vendedor.Id ?? vendedor.id}
                    >
                      {vendedor.Nome ?? vendedor.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* ---------- Campo de busca ---------- */}
            <div style={styles.searchBox}>
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar produto por nome ou código"
                style={{
                  ...styles.searchInput,
                  ...(isDark ? styles.searchInputDark : {}),
                }}
              />
            </div>

            {/* ---------- Lista de produtos ---------- */}
            <div style={styles.itensHeader}>
              <h2
                style={{
                  ...styles.sectionTitle,
                  ...(isDark ? styles.sectionTitleDark : {}),
                }}
              >
                Produtos da venda
              </h2>
              <button
                type="button"
                onClick={adicionarItem}
                style={{
                  ...styles.addButton,
                  ...(isDark ? styles.addButtonDark : {}),
                }}
              >
                <span className="material-symbols-outlined">add</span>
                Adicionar item
              </button>
            </div>

            {itens.map((item, index) => (
              <div
                key={index}
                style={{
                  ...styles.itemCard,
                  ...(isDark ? styles.itemCardDark : {}),
                }}
              >
                <div style={styles.grid}>
                  <label
                    style={{
                      ...styles.field,
                      ...(isDark ? styles.fieldDark : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.label,
                        ...(isDark ? styles.labelDark : {}),
                      }}
                    >
                      Produto
                    </span>
                    <select
                      value={item.idProduto}
                      onChange={(event) =>
                        atualizarItem(index, "idProduto", event.target.value)
                      }
                      style={{
                        ...styles.select,
                        ...(isDark ? styles.selectDark : {}),
                      }}
                    >
                      <option value="">Selecione um produto</option>
                      {produtosFiltrados.map((produto) => (
                        <option
                          key={getIdProduto(produto)}
                          value={getIdProduto(produto)}
                        >
                          {getNomeProduto(produto)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label
                    style={{
                      ...styles.field,
                      ...(isDark ? styles.fieldDark : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.label,
                        ...(isDark ? styles.labelDark : {}),
                      }}
                    >
                      Quantidade
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(event) =>
                        atualizarItem(index, "quantidade", event.target.value)
                      }
                      style={{
                        ...styles.input,
                        ...(isDark ? styles.inputDark : {}),
                      }}
                    />
                  </label>
                </div>

                <div
                  style={{
                    ...styles.itemMeta,
                    ...(isDark ? styles.itemMetaDark : {}),
                  }}
                >
                  <span>
                    Valor unitário: R${" "}
                    {Number(item.valorUnitario || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                  <span>
                    Total: R${" "}
                    {Number(item.valorTotal || 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>

                {itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerItem(index)}
                    style={{
                      ...styles.removeButton,
                      ...(isDark ? styles.removeButtonDark : {}),
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}

            {/* ---------- Total geral ---------- */}
            <div style={{ ...styles.totalBox, ...(isDark ? styles.totalBoxDark : {}) }}>
              <span style={{ ...(isDark ? styles.totalLabelDark : {}) }}>Total da venda</span>
              <strong style={{ ...styles.totalValue, ...(isDark ? styles.totalValueDark : {}) }}>
                R$ {totalGeral.toFixed(2).replace(".", ",")}
              </strong>
            </div>

            {/* ---------- Observações ---------- */}
            <div style={styles.formGroup}>
              <label
                style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}
              >
                Observações
              </label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={atualizarCampo}
                rows={4}
                style={{
                  ...styles.textarea,
                  ...(isDark ? styles.textareaDark : {}),
                }}
                placeholder="Observações adicionais da venda"
              />
            </div>

            {/* ---------- Ações ---------- */}
            <div style={styles.actions}>
              <PrimaryButton dark={isDark} disabled={loading} type="submit">
                {loading ? "Cadastrando..." : "Cadastrar venda"}
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
    padding: "32px 32px 40px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  },
  pageDark: { backgroundColor: "#111827", color: "#f3f4f6" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
  },
  title: { margin: 0, fontSize: "32px", color: "#111c2d", fontWeight: 700 },
  titleDark: { color: "#f9fafb" },
  subtitle: { margin: "8px 0 0", color: "#4a5568" },
  subtitleDark: { color: "#d1d5db" },
  backButton: {
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
  },
  backButtonDark: {
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
    maxWidth: "950px",
  },
  cardDark: { backgroundColor: "#111827", borderColor: "#374151" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  fieldDark: { color: "#e5e7eb" },
  label: { fontWeight: 600, color: "#303e51" },
  labelDark: { color: "#e5e7eb" },
  select: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7dfeb",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  selectDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7dfeb",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  inputDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d7dfeb",
    backgroundColor: "#f8fafc",
  },
  searchInput: {
    width: "100%",
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    color: "#111827",
  },
  searchInputDark: { color: "#f9fafb" },
  itensHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  sectionTitle: { margin: 0, fontSize: "22px", color: "#111c2d" },
  sectionTitleDark: { color: "#f9fafb" },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#111827",
    borderRadius: "10px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  addButtonDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  itemCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "18px",
    backgroundColor: "#f8fafc",
  },
  itemCardDark: { backgroundColor: "#1f2937", borderColor: "#374151" },
  itemMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "12px",
    color: "#475569",
    fontSize: "13px",
  },
  itemMetaDark: { color: "#d1d5db" },
  removeButton: { marginTop: "12px", border: "1px solid #fca5a5", backgroundColor: "#fff1f2", color: "#991b1b", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" },
  removeButtonDark: { backgroundColor: "#3f1721", borderColor: "#7f1d1d", color: "#fecdd3" },
  totalBox: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", backgroundColor: "#ffffff", borderRadius: "10px", color: "#0f172a", border: "1px solid #e2e8f0" },
  totalBoxDark: { backgroundColor: "#0b1220", border: "1px solid #334155", color: "#f8fafc" },
  totalLabelDark: { color: "#cbd5e1" },
  totalValue: { fontSize: "22px", color: "#0f172a" },
  totalValueDark: { color: "#f9fafb" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7dfeb",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111827",
    resize: "vertical",
  },
  textareaDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  actions: { display: "flex", justifyContent: "flex-end" },
};
