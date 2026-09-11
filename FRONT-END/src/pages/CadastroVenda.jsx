import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import PrimaryButton from "../components/PrimaryButton";
import { codiguitos_api } from "../services/tcc.api";
import { buscarProdutos } from "../services/produtosService";

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

// ---------- Normaliza retorno: array direto ou { result: [...] } ----------
function normalizarLista(lista) {
  if (Array.isArray(lista)) return lista;
  if (Array.isArray(lista?.result)) return lista.result;
  if (Array.isArray(lista?.data)) return lista.data;
  return [];
}

export default function CadastroVendas() {
  const navigate = useNavigate();

  const [form, setForm] = useState(estadoInicial);
  const [itens, setItens] = useState([{ ...itemVazio }]);

  const [produtos, setProdutos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);

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
    setItens((anterior) => {
      const novos = [...anterior];
      const item = { ...novos[index], [campo]: valor };

      // Recalcula valor unitário/total quando produto ou quantidade mudam
      if (campo === "idProduto" || campo === "quantidade") {
        const produto = produtos.find(
          (p) => Number(getIdProduto(p)) === Number(item.idProduto)
        );

        if (produto) {
          const preco = getPrecoProduto(produto);
          const qtd = Number(item.quantidade) || 0;
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

  // ---------- Adicionar item: adiciona já e recarrega em background ----------
  function adicionarItem() {
    setItens((anterior) => [...anterior, { ...itemVazio }]);
    carregarProdutos();
  }

  function removerItem(index) {
    setItens((anterior) => anterior.filter((_, i) => i !== index));
  }

  // ---------- Total geral ----------
  const totalGeral = itens.reduce(
    (acc, item) => acc + (Number(item.valorTotal) || 0),
    0
  );

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
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.page}>
        {/* ---------- Cabeçalho ---------- */}
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Cadastro de Vendas</h2>
            <p style={styles.subtitle}>
              Registre novas vendas e acompanhe o faturamento.
            </p>
          </div>

          <button
            type="button"
            style={styles.voltarButton}
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </button>
        </header>

        <section style={styles.card}>
          <AlertMessage type={mensagem.type} message={mensagem.text} />

          <form onSubmit={cadastrarVenda} style={styles.form}>
            {/* ---------- Proprietário + Vendedor (linha) ---------- */}
            <div style={styles.row}>
              {/* Proprietário */}
              <div style={styles.field}>
                <label style={styles.label}>Proprietário</label>
                <select
                  name="idProprietario"
                  value={form.idProprietario}
                  onChange={atualizarCampo}
                  style={styles.select}
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

              {/* Vendedor */}
              <div style={styles.field}>
                <label style={styles.label}>Vendedor</label>
                <select
                  name="idVendedor"
                  value={form.idVendedor}
                  onChange={atualizarCampo}
                  style={styles.select}
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
                <h3 style={styles.itemsTitle}>
                  Produtos da venda{" "}
                  {carregandoProdutos && (
                    <span style={styles.loadingHint}>atualizando...</span>
                  )}
                </h3>

                <div style={styles.headerButtons}>
                  <button
                    type="button"
                    style={styles.refreshButton}
                    onClick={carregarProdutos}
                    disabled={carregandoProdutos}
                    title="Atualizar lista de produtos"
                  >
                    ↻
                  </button>
                  <button
                    type="button"
                    style={styles.addButton}
                    onClick={adicionarItem}
                  >
                    + Adicionar produto
                  </button>
                </div>
              </div>

              {itens.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <select
                    value={item.idProduto}
                    onChange={(e) =>
                      atualizarItem(index, "idProduto", e.target.value)
                    }
                    style={{ ...styles.select, flex: 2 }}
                  >
                    <option value="">
                      {carregandoProdutos && produtos.length === 0
                        ? "Carregando produtos..."
                        : produtos.length === 0
                        ? "Nenhum produto cadastrado"
                        : "Selecione um produto..."}
                    </option>
                    {produtos.map((produto) => {
                      const id = getIdProduto(produto);
                      const nome = getNomeProduto(produto);
                      const preco = getPrecoProduto(produto);
                      return (
                        <option key={id} value={id}>
                          {nome} - R$ {preco.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(index, "quantidade", e.target.value)
                    }
                    style={{ ...styles.select, width: "90px" }}
                    placeholder="Qtd"
                  />

                  <input
                    type="text"
                    value={`R$ ${Number(item.valorTotal).toFixed(2)}`}
                    readOnly
                    style={{
                      ...styles.select,
                      width: "130px",
                      background: "#f1f5f9",
                    }}
                  />

                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removerItem(index)}
                    disabled={itens.length === 1}
                    title={
                      itens.length === 1
                        ? "Adicione pelo menos um produto"
                        : "Remover produto"
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div style={styles.totalBox}>
                <span style={styles.totalLabel}>Total da venda</span>
                <strong style={styles.totalValue}>
                  R$ {totalGeral.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* ---------- Observações ---------- */}
            <div style={styles.fieldFull}>
              <label style={styles.label}>Observações</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={atualizarCampo}
                placeholder="Observações adicionais sobre a venda (opcional)"
                style={styles.textarea}
                rows="3"
              />
            </div>

            {/* ---------- Ações ---------- */}
            <div style={styles.actions}>
              <PrimaryButton disabled={loading}>
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
  page: {
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  },
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
  subtitle: { margin: "8px 0 0", color: "#4a5568" },

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

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    maxWidth: "900px",
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
  loadingHint: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 400,
    marginLeft: "8px",
  },
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
  itemRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  removeButton: {
    border: "1px solid #fecaca",
    backgroundColor: "#fff",
    color: "#b91c1c",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#f1f5f9",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  totalLabel: { color: "#303e51", fontWeight: 600, fontSize: "14px" },
  totalValue: { color: "#111c2d", fontSize: "20px" },
};