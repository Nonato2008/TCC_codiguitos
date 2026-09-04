import { useState } from "react";
import Sidebar from "../components/Sidebar";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import PrimaryButton from "../components/PrimaryButton";
import { codiguitos_api } from "../services/tcc.api";

const estadoInicial = {
    idFornecedor: "1",
    nome: "",
    preco: "",
    quantidade: "",
    dataVenc: "",
    imagem: null,
};

export default function CadastroProdutos() {
    const [form, setForm] = useState(estadoInicial);
    const [loading, setLoading] = useState(false);
    // mensagem.type controla o estilo do AlertMessage ("success" | "error" | "")
    const [mensagem, setMensagem] = useState({ type: "", text: "" });

    function atualizarCampo(event) {
        const { name, value, files } = event.target;

        if (name === "imagem") {
            setForm((anterior) => ({ ...anterior, imagem: files[0] || null }));
            return;
        }

        setForm((anterior) => ({ ...anterior, [name]: value }));
    }

    async function cadastrarProduto(event) {
        event.preventDefault();

        // Validação manual campo a campo, na ordem em que aparecem no form.
        // Cada `return` antecipado evita chamar a API com dados incompletos.
        if (!form.nome.trim()) {
            setMensagem({ type: "error", text: "Informe o nome do produto." });
            return;
        }

        if (!form.preco || Number(form.preco) <= 0) {
            setMensagem({ type: "error", text: "Informe um preço válido." });
            return;
        }

        if (!form.quantidade || Number(form.quantidade) < 0) {
            setMensagem({ type: "error", text: "Informe a quantidade em estoque." });
            return;
        }

        if (!form.dataVenc) {
            setMensagem({ type: "error", text: "Selecione a data de vencimento." });
            return;
        }

        if (!form.imagem) {
            setMensagem({ type: "error", text: "Selecione uma imagem do produto." });
            return;
        }

        setLoading(true);
        // Limpa mensagem anterior antes de tentar novamente
        setMensagem({ type: "", text: "" });

        try {
            // FormData é obrigatório aqui porque estamos enviando um arquivo
            // (imagem) junto com os demais campos — não dá pra mandar JSON puro.
            const dados = new FormData();
            dados.append("idFornecedor", String(form.idFornecedor || 1));
            dados.append("nome", form.nome.trim());
            dados.append("preco", String(form.preco));
            dados.append("quantidade", String(form.quantidade));
            dados.append("dataVenc", form.dataVenc);
            dados.append("imagem", form.imagem);

            await codiguitos_api.post("/produtos", dados, {
                headers: {
                    // Necessário explicitar multipart/form-data por causa do upload de arquivo
                    "Content-Type": "multipart/form-data",
                },
            });

            setMensagem({ type: "success", text: "Produto cadastrado com sucesso!" });
            // Reseta o formulário após sucesso, incluindo o input de arquivo
            setForm(estadoInicial);
        } catch (error) {
            console.error(error);
            // Prioriza mensagem de erro vinda da API; usa fallback genérico se não houver
            setMensagem({
                type: "error",
                text: error?.response?.data?.message || "Erro ao cadastrar produto.",
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
                    <h2 style={styles.title}>Cadastro de Produtos</h2>
                    <p style={styles.subtitle}>Adicione novos itens ao estoque da adega.</p>
                </header>

                <section style={styles.card}>
                    <AlertMessage type={mensagem.type} message={mensagem.text} />

                    <form onSubmit={cadastrarProduto} style={styles.form}>
                        <div style={styles.grid}>
                            <FormField
                                label="Fornecedor"
                                name="idFornecedor"
                                type="number"
                                min="1"
                                value={form.idFornecedor}
                                onChange={atualizarCampo}
                            />

                            <FormField
                                label="Nome do produto"
                                name="nome"
                                placeholder="Ex: Vinho Tinto"
                                value={form.nome}
                                onChange={atualizarCampo}
                            />

                            <FormField
                                label="Preço"
                                name="preco"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={form.preco}
                                onChange={atualizarCampo}
                            />

                            <FormField
                                label="Quantidade"
                                name="quantidade"
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={form.quantidade}
                                onChange={atualizarCampo}
                            />

                            <FormField
                                label="Data de vencimento"
                                name="dataVenc"
                                type="date"
                                value={form.dataVenc}
                                onChange={atualizarCampo}
                            />

                            <label style={styles.field}>
                                <span style={styles.label}>Imagem do produto</span>
                                <input
                                    type="file"
                                    name="imagem"
                                    accept="image/png,image/jpeg"
                                    onChange={atualizarCampo}
                                    style={styles.fileInput}
                                />
                            </label>
                        </div>

                        <div style={styles.actions}>
                            <PrimaryButton disabled={loading}>
                                {loading ? "Cadastrando..." : "Cadastrar produto"}
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
        // Compensa a largura fixa da Sidebar (256px) para o conteúdo não ficar por baixo dela
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
    label: {
        fontWeight: 600,
        color: "#303e51",
    },
    fileInput: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px dashed #cbd5e1",
        borderRadius: "10px",
        padding: "12px",
        backgroundColor: "#f8fafc",
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
    },
};