import { useState } from "react";
import Sidebar from "../components/Sidebar";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import PrimaryButton from "../components/PrimaryButton";
import { codiguitos_api } from "../services/tcc.api";
import { buscarProdutos } from "../services/produtosService";

const estadoInicial = {
    idProduto: "",
    idVendedor: "",
    quantidade: "1",
    valorUnitario: "0.00",
    valorTotal: "0.00",
    dataVenda: new Date().toISOString().split("T")[0],
    formaPagamento: "dinheiro",
    observacoes: "",
};

export default function CadastroVendas() {
    const [form, setForm] = useState(estadoInicial);
    const [produtos, setProdutos] = useState([]);
    const [vendedores, setVendedores] = useState([
  
    ]);
    const [loading, setLoading] = useState(false);
    const [carregandoProdutos, setCarregandoProdutos] = useState(false);
    const [mensagem, setMensagem] = useState({ type: "", text: "" });

    // Carregar produtos disponíveis
    useState(() => {
        async function carregarProdutos() {
            setCarregandoProdutos(true);
            try {
                const produtosCarregados = await buscarProdutos();
                setProdutos(produtosCarregados);
            } catch (error) {
                console.error("Erro ao carregar produtos:", error);
                setMensagem({
                    type: "error",
                    text: "Não foi possível carregar os produtos disponíveis.",
                });
            } finally {
                setCarregandoProdutos(false);
            }
        }
        carregarProdutos();
    }, []);

    function atualizarCampo(event) {
        const { name, value } = event.target;
        
        setForm((anterior) => {
            const novoForm = { ...anterior, [name]: value };
            
            // Calcula automaticamente o valor total quando produto ou quantidade mudam
            if (name === "idProduto" || name === "quantidade") {
                const produtoSelecionado = produtos.find(p => p.id === Number(novoForm.idProduto));
                if (produtoSelecionado) {
                    const quantidade = Number(novoForm.quantidade) || 0;
                    novoForm.valorUnitario = produtoSelecionado.preco.toFixed(2);
                    novoForm.valorTotal = (produtoSelecionado.preco * quantidade).toFixed(2);
                }
            }
            
            return novoForm;
        });
    }

    async function cadastrarVenda(event) {
        event.preventDefault();

        // Validação manual campo a campo
        if (!form.idProduto) {
            setMensagem({ type: "error", text: "Selecione um produto." });
            return;
        }

        if (!form.idVendedor) {
            setMensagem({ type: "error", text: "Selecione um vendedor." });
            return;
        }

        if (!form.quantidade || Number(form.quantidade) <= 0) {
            setMensagem({ type: "error", text: "Informe uma quantidade válida." });
            return;
        }

        if (!form.valorTotal || Number(form.valorTotal) <= 0) {
            setMensagem({ type: "error", text: "O valor total deve ser maior que zero." });
            return;
        }

        if (!form.dataVenda) {
            setMensagem({ type: "error", text: "Selecione a data da venda." });
            return;
        }

        setLoading(true);
        setMensagem({ type: "", text: "" });

        try {
            const dados = {
                idProduto: Number(form.idProduto),
                idVendedor: Number(form.idVendedor),
                quantidade: Number(form.quantidade),
                valorUnitario: Number(form.valorUnitario),
                valorTotal: Number(form.valorTotal),
                dataVenda: form.dataVenda,
                formaPagamento: form.formaPagamento,
                observacoes: form.observacoes?.trim() || "",
            };

            await codiguitos_api.post("/vendas", dados, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setMensagem({ type: "success", text: "Venda registrada com sucesso!" });
            setForm(estadoInicial);
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

    return (
        <div style={styles.layout}>
            <Sidebar />

            <main style={styles.page}>
                <header style={styles.header}>
                    <h2 style={styles.title}>Cadastro de Vendas</h2>
                    <p style={styles.subtitle}>Registre novas vendas e acompanhe o faturamento.</p>
                </header>

                <section style={styles.card}>
                    <AlertMessage type={mensagem.type} message={mensagem.text} />

                    <form onSubmit={cadastrarVenda} style={styles.form}>
                        <div style={styles.grid}>
                            <div style={styles.field}>
                                <label style={styles.label}>Produto</label>
                                <select
                                    name="idProduto"
                                    value={form.idProduto}
                                    onChange={atualizarCampo}
                                    style={styles.select}
                                    disabled={carregandoProdutos}
                                >
                                    <option value="">Selecione um produto...</option>
                                    {produtos.map((produto) => (
                                        <option key={produto.id} value={produto.id}>
                                            {produto.nome} - R$ {Number(produto.preco).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Vendedor</label>
                                <select
                                    name="idVendedor"
                                    value={form.idVendedor}
                                    onChange={atualizarCampo}
                                    style={styles.select}
                                >
                                    <option value="">Selecione um vendedor...</option>
                                    {vendedores.map((vendedor) => (
                                        <option key={vendedor.id} value={vendedor.id}>
                                            {vendedor.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <FormField
                                label="Quantidade"
                                name="quantidade"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="1"
                                value={form.quantidade}
                                onChange={atualizarCampo}
                            />

                            <FormField
                                label="Valor Unitário (R$)"
                                name="valorUnitario"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={form.valorUnitario}
                                onChange={atualizarCampo}
                                disabled={true}
                            />

                            <FormField
                                label="Valor Total (R$)"
                                name="valorTotal"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={form.valorTotal}
                                onChange={atualizarCampo}
                                disabled={true}
                            />

                            <FormField
                                label="Data da Venda"
                                name="dataVenda"
                                type="date"
                                value={form.dataVenda}
                                onChange={atualizarCampo}
                            />

                            <div style={styles.field}>
                                <label style={styles.label}>Forma de Pagamento</label>
                                <select
                                    name="formaPagamento"
                                    value={form.formaPagamento}
                                    onChange={atualizarCampo}
                                    style={styles.select}
                                >
                                    <option value="dinheiro">Dinheiro</option>
                                    <option value="cartao_credito">Cartão de Crédito</option>
                                    <option value="cartao_debito">Cartão de Débito</option>
                                    <option value="pix">PIX</option>
                                    <option value="boleto">Boleto</option>
                                </select>
                            </div>

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
                        </div>

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
    layout: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f3f5f9",
    },
    page: {
        marginLeft: "256px",
        width: "calc(100% - 256px)",
        padding: "32px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
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
    card: {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        maxWidth: "900px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "20px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    fieldFull: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        gridColumn: "span 2",
    },
    label: {
        fontWeight: 600,
        color: "#303e51",
    },
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
    actions: {
        display: "flex",
        justifyContent: "flex-end",
    },
};