import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  LoaderCircle,
  Minus,
  PackagePlus,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCw,
  Search,
  Store,
  Trash2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import { codiguitos_api } from "../services/tcc.api";
import { buscarProdutos } from "../services/produtosService";
import { ThemeContext } from "../contexts/ThemeContext";
import { LinhaItemVenda, TotalVenda } from "../components/LinhaItemVenda";
import { getUser } from "../services/authService";

const estadoInicial = {
  idProprietario: "",
  idVendedor: "",
  formaPagamento: "",
  observacoes: "",
};

const opcoesFormaPagamento = [
  { nome: "Crédito", Icon: CreditCard },
  { nome: "Débito", Icon: CreditCard },
  { nome: "Pix", Icon: QrCode },
  { nome: "Dinheiro", Icon: Banknote },
];

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
  const usuarioAtual = getUser();
  const perfilAtual = String(usuarioAtual?.tipo ?? usuarioAtual?.perfil ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  const [form, setForm] = useState(estadoInicial);
  const [itens, setItens] = useState([]);
  const [proprietarioAutomatico, setProprietarioAutomatico] = useState(false);
  const [vendedorAutomatico, setVendedorAutomatico] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);

  const [buscaProduto, setBuscaProduto] = useState("");

  const [loading, setLoading] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [carregandoVendedores, setCarregandoVendedores] = useState(false);
  const [carregandoProprietarios, setCarregandoProprietarios] = useState(false);
  const [mensagem, setMensagem] = useState({ type: "", text: "" });

  // Guarda os dados do protótipo/comprovante da venda gerada
  const [prototipoVenda, setPrototipoVenda] = useState(null);

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
        const listaVendedores = normalizarLista(data);
        setVendedores(listaVendedores);

        if (perfilAtual === "VENDEDOR" && usuarioAtual?.id) {
          const vendedorSessao = listaVendedores.find(
            (vendedor) => Number(vendedor.Id ?? vendedor.id) === Number(usuarioAtual.id)
          );

          if (vendedorSessao) {
            const idProprietario = vendedorSessao.IdProprietario ?? vendedorSessao.idProprietario;
            setForm((atual) => ({
              ...atual,
              idVendedor: String(vendedorSessao.Id ?? vendedorSessao.id),
              idProprietario: idProprietario ? String(idProprietario) : atual.idProprietario,
            }));
            setVendedorAutomatico(true);
            setProprietarioAutomatico(Boolean(idProprietario));
          }
        }
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
        const listaProprietarios = normalizarLista(data);
        setProprietarios(listaProprietarios);

        if (perfilAtual === "PROPRIETARIO" && usuarioAtual?.id) {
          const proprietarioSessao = listaProprietarios.find(
            (proprietario) => Number(proprietario.Id ?? proprietario.id) === Number(usuarioAtual.id)
          );

          if (proprietarioSessao) {
            setForm((atual) => ({
              ...atual,
              idProprietario: String(proprietarioSessao.Id ?? proprietarioSessao.id),
            }));
            setProprietarioAutomatico(true);
          }
        }
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
    if (name === "idProprietario") setProprietarioAutomatico(false);
  }

  function atualizarVendedor(event) {
    const idVendedor = event.target.value;
    const vendedor = vendedores.find(
      (item) => String(item.Id ?? item.id) === String(idVendedor)
    );
    const idProprietario = vendedor?.IdProprietario ?? vendedor?.idProprietario;

    setForm((atual) => ({
      ...atual,
      idVendedor,
      ...(idProprietario ? { idProprietario: String(idProprietario) } : {}),
    }));
    setVendedorAutomatico(false);
    setProprietarioAutomatico(Boolean(idProprietario));
  }

  function adicionarProduto(produto) {
    const idProduto = getIdProduto(produto);
    const jaAdicionado = itens.some((item) => Number(item.idProduto) === Number(idProduto));
    const estoque = getEstoqueProduto(produto);

    if (jaAdicionado) {
      setMensagem({ type: "error", text: "Esse produto já está na venda." });
      return;
    }

    if (estoque < 1) {
      setMensagem({ type: "error", text: "Este produto está sem estoque." });
      return;
    }

    const preco = getPrecoProduto(produto);
    setItens((anteriores) => [...anteriores, {
      idProduto: String(idProduto),
      quantidade: 1,
      valorUnitario: preco,
      valorTotal: preco,
    }]);
    setBuscaProduto("");
    setMensagem({ type: "", text: "" });
  }

  function alterarQuantidade(index, valor) {
    const item = itens[index];
    const produto = produtos.find((p) => Number(getIdProduto(p)) === Number(item?.idProduto));
    const estoque = produto ? getEstoqueProduto(produto) : 0;
    const quantidade = Math.min(estoque, Math.max(1, Number(valor) || 1));

    setItens((anteriores) => anteriores.map((linha, linhaIndex) => (
      linhaIndex === index
        ? { ...linha, quantidade, valorTotal: linha.valorUnitario * quantidade }
        : linha
    )));
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

  const quantidadeTotal = itens.reduce((total, item) => total + Number(item.quantidade || 0), 0);

  const proprietarioSelecionado = proprietarios.find(
    (item) => Number(item.Id ?? item.id) === Number(form.idProprietario)
  );

  // ---------- Produtos filtrados pela busca ----------
  const produtosFiltrados = produtos.filter((produto) => {
    const termo = buscaProduto.trim().toLowerCase();
    if (!termo) return true;
    const nome = getNomeProduto(produto).toLowerCase();
    const id = String(getIdProduto(produto));
    return nome.includes(termo) || id.includes(termo);
  });

  const idsAdicionados = new Set(itens.map((item) => Number(item.idProduto)));
  const podeRegistrar = Boolean(
    !loading && form.idProprietario && form.idVendedor && form.formaPagamento && itens.length > 0
  );

  // ---------- Submit ----------
  async function cadastrarVenda(event) {
    event.preventDefault();

    // Limpa o protótipo anterior antes de uma nova tentativa
    setPrototipoVenda(null);

    if (!form.idProprietario) {
      setMensagem({ type: "error", text: "Selecione um proprietário." });
      return;
    }

    if (!form.idVendedor) {
      setMensagem({ type: "error", text: "Selecione um vendedor." });
      return;
    }

    if (!form.formaPagamento) {
      setMensagem({
        type: "error",
        text: "Selecione uma forma de pagamento.",
      });
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
        formaPagamento: String(form.formaPagamento),
        observacoes: form.observacoes?.trim() || "",
        valorTotal: Number(totalGeral.toFixed(2)),
        itens: itensValidos.map((i) => ({
          idProduto: Number(i.idProduto),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.valorUnitario),
          valorTotal: Number(i.valorTotal),
        })),
      };

      const resposta = await codiguitos_api.post("/vendas", dados, {
        headers: { "Content-Type": "application/json" },
      });

      const data = resposta?.data || {};

      // Busca os nomes de proprietário/vendedor para o protótipo
      const proprietario = proprietarios.find(
        (p) => Number(p.Id ?? p.id) === Number(form.idProprietario)
      );
      const vendedor = vendedores.find(
        (v) => Number(v.Id ?? v.id) === Number(form.idVendedor)
      );

      // Monta o protótipo/comprovante da venda
      setPrototipoVenda({
        numero: data.numero ?? data.idVenda ?? data.id ?? null,
        dataEmissao: data.dataEmissao ?? new Date().toISOString(),
        proprietarioNome:
          proprietario?.Nome ?? proprietario?.nome ?? "—",
        vendedorNome: vendedor?.Nome ?? vendedor?.nome ?? "—",
        observacoes: dados.observacoes,
        valorTotal: Number(data.valorTotal ?? dados.valorTotal),
        itens: itensValidos.map((i) => {
          const produto = produtos.find(
            (p) => Number(getIdProduto(p)) === Number(i.idProduto)
          );
          return {
            nome: getNomeProduto(produto),
            quantidade: Number(i.quantidade),
            valorUnitario: Number(i.valorUnitario),
            valorTotal: Number(i.valorTotal),
          };
        }),
      });

      const mensagemBase = (
        data?.message || "Venda registrada com sucesso!"
      ).trim();

      setMensagem({
        type: "success",
        text: `${mensagemBase}${
          mensagemBase.endsWith(".") ? "" : "."
        } Protótipo gerado.`,
      });

      setForm(estadoInicial);
      setItens([]);
      setBuscaProduto("");
    } catch (error) {
      console.error(error);
      setMensagem({
        type: "error",
        text:
          error?.response?.data?.message || "Erro ao registrar venda.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ---------- Render ----------
  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main className="sale-entry-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        {/* ---------- Cabeçalho ---------- */}
        <header className="sale-entry-header" style={styles.header}>
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
              Escolha o pagamento, adicione produtos e confira o total antes de registrar.
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
            <ArrowLeft size={17} aria-hidden="true" />
            Voltar
          </button>
        </header>

        <section className="sale-entry-card" style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>
          <AlertMessage
            type={mensagem.type}
            message={mensagem.text}
            dark={isDark}
          />

          <form onSubmit={cadastrarVenda} className="sale-entry-form" style={styles.form}>
            <div className="sale-entry-meta">
              {proprietarioAutomatico ? (
                <div className="sale-owner-context">
                  <span className="sale-entry-label">Responsável pela loja</span>
                  <div><Store size={17} aria-hidden="true" />{proprietarioSelecionado?.Nome ?? proprietarioSelecionado?.nome ?? (carregandoProprietarios ? "Carregando loja..." : `Proprietário #${form.idProprietario}`)}</div>
                  <small>Responsável associado automaticamente</small>
                </div>
              ) : (
                <SelectField
                  label="Loja responsável"
                  name="idProprietario"
                  value={form.idProprietario}
                  onChange={atualizarCampo}
                  disabled={carregandoProprietarios}
                  isDark={isDark}
                >
                  <option value="">{carregandoProprietarios ? "Carregando lojas..." : "Selecione a loja..."}</option>
                  {proprietarios.map((proprietario) => {
                    const id = proprietario.Id ?? proprietario.id;
                    const nome = proprietario.Nome ?? proprietario.nome ?? "Sem nome";
                    return <option key={id} value={id}>{nome}</option>;
                  })}
                </SelectField>
              )}

              <SelectField
                label="Vendedor"
                name="idVendedor"
                value={form.idVendedor}
                onChange={atualizarVendedor}
                disabled={carregandoVendedores || vendedorAutomatico}
                isDark={isDark}
              >
                <option value="">{carregandoVendedores ? "Carregando vendedores..." : "Selecione um vendedor..."}</option>
                {vendedores.map((vendedor) => {
                  const id = vendedor.Id ?? vendedor.id;
                  const nome = vendedor.Nome ?? vendedor.nome ?? "Sem nome";
                  return <option key={id} value={id}>{nome}</option>;
                })}
              </SelectField>

              <fieldset className="sale-payment-methods">
                <legend>Forma de pagamento</legend>
                <div role="radiogroup" aria-label="Forma de pagamento">
                  {opcoesFormaPagamento.map(({ nome, Icon }) => (
                    <button
                      key={nome}
                      type="button"
                      role="radio"
                      aria-checked={form.formaPagamento === nome}
                      className={form.formaPagamento === nome ? "is-selected" : ""}
                      onClick={() => setForm((atual) => ({ ...atual, formaPagamento: nome }))}
                    >
                      <Icon size={17} aria-hidden="true" />
                      <span>{nome}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <section className="sale-products-section" aria-labelledby="sale-products-title">
              <div className="sale-products-heading">
                <div>
                  <h3 id="sale-products-title">Produtos da venda</h3>
                  <p>{itens.length} {itens.length === 1 ? "produto" : "produtos"} · {quantidadeTotal} {quantidadeTotal === 1 ? "unidade" : "unidades"}</p>
                </div>
                <button type="button" className="sale-refresh-products" onClick={carregarProdutos} disabled={carregandoProdutos} title="Atualizar produtos">
                  <RefreshCw size={16} className={carregandoProdutos ? "is-spinning" : ""} aria-hidden="true" />
                  <span>{carregandoProdutos ? "Atualizando" : "Atualizar"}</span>
                </button>
              </div>

              <div className="sale-product-picker">
                <label className="sale-search-box">
                  <Search size={18} aria-hidden="true" />
                  <input
                    type="search"
                    value={buscaProduto}
                    onChange={(event) => setBuscaProduto(event.target.value)}
                    placeholder="Buscar produto por nome ou código"
                    role="combobox"
                    aria-label="Buscar produto para adicionar à venda"
                    aria-expanded={Boolean(buscaProduto.trim())}
                    aria-controls="sale-product-suggestions"
                    autoComplete="off"
                  />
                  {buscaProduto && <button type="button" onClick={() => setBuscaProduto("")} aria-label="Limpar busca">×</button>}
                </label>

                {buscaProduto.trim() && (
                  <div id="sale-product-suggestions" className="sale-product-suggestions" role="listbox" aria-label="Produtos encontrados">
                    {produtosFiltrados.length ? produtosFiltrados.slice(0, 8).map((produto) => {
                      const produtoId = getIdProduto(produto);
                      const nome = getNomeProduto(produto);
                      const estoque = getEstoqueProduto(produto);
                      const preco = getPrecoProduto(produto);
                      const jaAdicionado = idsAdicionados.has(Number(produtoId));
                      const indisponivel = estoque < 1 || jaAdicionado;

                      return (
                        <button
                          key={produtoId}
                          type="button"
                          role="option"
                          aria-selected={false}
                          disabled={indisponivel}
                          onClick={() => adicionarProduto(produto)}
                        >
                          <span className="sale-product-suggestion-main">
                            <strong>{nome}</strong>
                            <small>{jaAdicionado ? "Já está na venda" : `Estoque disponível: ${estoque}`}</small>
                          </span>
                          <strong className="sale-product-suggestion-price">{preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                          {!indisponivel && <Plus size={17} aria-hidden="true" />}
                        </button>
                      );
                    }) : (
                      <p className="sale-product-no-results">Nenhum produto encontrado.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="sale-cart-table-wrap">
                <table className="sale-cart-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Preço unit.</th>
                      <th>Estoque</th>
                      <th>Quantidade</th>
                      <th>Subtotal</th>
                      <th><span className="visually-hidden">Ação</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.length ? itens.map((item, index) => {
                      const produto = produtos.find((p) => Number(getIdProduto(p)) === Number(item.idProduto));
                      return (
                        <LinhaItemVenda
                          key={item.idProduto}
                          index={index}
                          item={item}
                          produto={produto}
                          alterarQuantidade={alterarQuantidade}
                          removerItem={removerItem}
                          isDark={isDark}
                        />
                      );
                    }) : (
                      <tr className="sale-cart-empty-row">
                        <td colSpan="6">
                          <PackagePlus size={23} aria-hidden="true" />
                          <strong>Nenhum produto adicionado</strong>
                          <span>Busque um produto acima para começar a venda.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <TotalVenda totalGeral={totalGeral} itemCount={quantidadeTotal} isDark={isDark} />
            </section>

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
                rows="2"
              />
            </div>

            {/* ---------- Ações ---------- */}
            <div className="sale-entry-actions" style={styles.actions}>
              {!podeRegistrar && !loading && <span className="sale-submit-hint">Informe loja, vendedor, pagamento e ao menos um produto válido.</span>}
              <button className="sale-submit-button" disabled={!podeRegistrar} type="submit">
                {loading ? <LoaderCircle className="is-spinning" size={18} aria-hidden="true" /> : <ReceiptText size={18} aria-hidden="true" />}
                {loading ? "Registrando venda..." : "Registrar venda"}
              </button>
            </div>
          </form>

          {/* ---------- Protótipo da Venda ---------- */}
          {prototipoVenda && (
            <div
              style={{
                ...styles.prototipo,
                ...(isDark ? styles.prototipoDark : {}),
              }}
            >
              <div
                style={{
                  ...styles.prototipoHeader,
                  ...(isDark ? styles.prototipoHeaderDark : {}),
                }}
              >
                <div>
                  <h3
                    style={{
                      ...styles.prototipoTitle,
                      ...(isDark ? styles.prototipoTitleDark : {}),
                    }}
                  >
                    Protótipo da Venda
                  </h3>
                  {prototipoVenda.numero && (
                    <p
                      style={{
                        ...styles.prototipoNumero,
                        ...(isDark ? styles.prototipoNumeroDark : {}),
                      }}
                    >
                      Nº {prototipoVenda.numero}
                    </p>
                  )}
                </div>

                <span
                  style={{
                    ...styles.prototipoStatus,
                    ...(isDark ? styles.prototipoStatusDark : {}),
                  }}
                >
                  Registrada
                </span>
              </div>

              <div
                style={{
                  ...styles.prototipoLinha,
                  ...(isDark ? styles.prototipoLinhaDark : {}),
                }}
              >
                <span>Data de emissão</span>
                <strong>
                  {new Date(prototipoVenda.dataEmissao).toLocaleString(
                    "pt-BR"
                  )}
                </strong>
              </div>

              <div
                style={{
                  ...styles.prototipoLinha,
                  ...(isDark ? styles.prototipoLinhaDark : {}),
                }}
              >
                <span>Proprietário</span>
                <strong>{prototipoVenda.proprietarioNome}</strong>
              </div>

              <div
                style={{
                  ...styles.prototipoLinha,
                  ...(isDark ? styles.prototipoLinhaDark : {}),
                }}
              >
                <span>Vendedor</span>
                <strong>{prototipoVenda.vendedorNome}</strong>
              </div>

              {prototipoVenda.observacoes && (
                <div
                  style={{
                    ...styles.prototipoLinha,
                    ...(isDark ? styles.prototipoLinhaDark : {}),
                  }}
                >
                  <span>Observações</span>
                  <strong>{prototipoVenda.observacoes}</strong>
                </div>
              )}

              <div
                style={{
                  ...styles.prototipoItensTitulo,
                  ...(isDark ? styles.prototipoItensTituloDark : {}),
                }}
              >
                Itens da venda
              </div>

              {prototipoVenda.itens.map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.prototipoItem,
                    ...(isDark ? styles.prototipoItemDark : {}),
                  }}
                >
                  <div>
                    <strong>{item.nome}</strong>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {item.quantidade} ×{" "}
                      {item.valorUnitario.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                  <strong>
                    {item.valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>
              ))}

              <div
                style={{
                  ...styles.prototipoTotal,
                  ...(isDark ? styles.prototipoTotalDark : {}),
                }}
              >
                <span>TOTAL</span>
                <strong>
                  {Number(prototipoVenda.valorTotal).toLocaleString(
                    "pt-BR",
                    { style: "currency", currency: "BRL" }
                  )}
                </strong>
              </div>

              <p
                style={{
                  ...styles.prototipoAviso,
                  ...(isDark ? styles.prototipoAvisoDark : {}),
                }}
              >
                Este é um protótipo/comprovante gerado automaticamente
                e não substitui documentos fiscais.
              </p>
            </div>
          )}
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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

  // ---------- Protótipo da Venda ----------
  prototipo: {
    marginTop: "32px",
    padding: "24px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
  },
  prototipoDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
  },
  prototipoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  prototipoHeaderDark: {
    borderBottomColor: "#4b5563",
  },
  prototipoTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#111c2d",
  },
  prototipoTitleDark: { color: "#f9fafb" },
  prototipoNumero: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  prototipoNumeroDark: { color: "#cbd5e1" },
  prototipoStatus: {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: "13px",
    fontWeight: 600,
  },
  prototipoStatusDark: {
    backgroundColor: "#064e3b",
    color: "#d1fae5",
  },
  prototipoLinha: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
  },
  prototipoLinhaDark: {
    borderBottomColor: "#4b5563",
    color: "#e5e7eb",
  },
  prototipoItensTitulo: {
    marginTop: "18px",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#64748b",
  },
  prototipoItensTituloDark: { color: "#94a3b8" },
  prototipoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    marginBottom: "8px",
    color: "#111c2d",
  },
  prototipoItemDark: {
    backgroundColor: "#0b1220",
    borderColor: "#334155",
    color: "#f9fafb",
  },
  prototipoTotal: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "2px solid #e2e8f0",
    fontSize: "20px",
    color: "#111c2d",
  },
  prototipoTotalDark: {
    borderTopColor: "#4b5563",
    color: "#f9fafb",
  },
  prototipoAviso: {
    margin: "20px 0 0",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fff7ed",
    color: "#9a3412",
    fontSize: "13px",
    textAlign: "center",
  },
  prototipoAvisoDark: {
    backgroundColor: "#3f2715",
    color: "#fed7aa",
  },
};

function SelectField({ label, name, value, onChange, disabled, isDark, children }) {
  return (
    <div style={styles.field}>
      <label
        style={{
          ...styles.label,
          ...(isDark ? styles.labelDark : {}),
        }}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          ...styles.select,
          ...(isDark ? styles.selectDark : {}),
        }}
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  );
}