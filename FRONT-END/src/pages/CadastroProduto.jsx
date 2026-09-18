import { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import FormField from "../components/FormField";
import AlertMessage from "../components/AlertMessage";
import PrimaryButton from "../components/PrimaryButton";
import { codiguitos_api } from "../services/tcc.api";
import { formatErrorMessage } from "../utils/formatErrorMessage";
import { ThemeContext } from "../contexts/ThemeContext";
import { useFornecedores } from "../hooks/useFornecedores";

const estadoInicial = {
    idFornecedor: "",
    nome: "",
    preco: "",
    quantidade: "",
    dataVenc: "",
    imagem: null,
};

export default function CadastroProdutos() {

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const { fornecedores, loading: carregandoFornecedores } = useFornecedores();

    const [form, setForm] = useState(estadoInicial);

    const [loading, setLoading] = useState(false);

    const [mensagem, setMensagem] = useState({
        type: "",
        text: ""
    });

    const [notaFiscal, setNotaFiscal] = useState(null);

    function atualizarCampo(event) {

        const {
            name,
            value,
            files
        } = event.target;

        if (name === "imagem") {

            setForm((anterior) => ({
                ...anterior,
                imagem: files[0] || null
            }));

            return;
        }

        setForm((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    function abrirPDF(base64) {

        try {

            const byteCharacters =
                atob(base64);

            const byteNumbers =
                new Array(byteCharacters.length);

            for (
                let i = 0;
                i < byteCharacters.length;
                i++
            ) {

                byteNumbers[i] =
                    byteCharacters.charCodeAt(i);

            }

            const byteArray =
                new Uint8Array(byteNumbers);

            const blob =
                new Blob(
                    [byteArray],
                    {
                        type: "application/pdf"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            window.open(url, "_blank");

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 10000);

        } catch (error) {

            console.error(
                "Erro ao abrir PDF:",
                error
            );

            setMensagem((anterior) => ({
                // preserva mensagem de sucesso caso já exista, e anexa um aviso
                type: anterior?.type === "success" ? "success" : "error",
                text: anterior?.text
                    ? `${anterior.text} A nota foi gerada, mas não foi possível abrir o PDF.`
                    : "A nota foi gerada, mas não foi possível abrir o PDF.",
            }));

        }
    }

    async function cadastrarProduto(event) {

        event.preventDefault();

        setNotaFiscal(null);

        if (!form.nome.trim()) {

            setMensagem({
                type: "error",
                text: "Informe o nome do produto."
            });

            return;
        }

        if (!form.idFornecedor) {

            setMensagem({
                type: "error",
                text: "Selecione um fornecedor existente."
            });

            return;
        }

        if (!form.preco || Number(form.preco) <= 0) {

            setMensagem({
                type: "error",
                text: "Informe um preço válido."
            });

            return;
        }

        if (
            form.quantidade === "" ||
            Number(form.quantidade) < 0
        ) {

            setMensagem({
                type: "error",
                text: "Informe a quantidade em estoque."
            });

            return;
        }

        if (!form.dataVenc) {

            setMensagem({
                type: "error",
                text: "Selecione a data de vencimento."
            });

            return;
        }

        if (!form.imagem) {

            setMensagem({
                type: "error",
                text: "Selecione uma imagem do produto."
            });

            return;
        }

        setLoading(true);

        setMensagem({
            type: "",
            text: ""
        });

        try {

            const dados = new FormData();

            dados.append(
                "idFornecedor",
                String(form.idFornecedor)
            );

            dados.append(
                "nome",
                form.nome.trim()
            );

            dados.append(
                "preco",
                String(form.preco)
            );

            dados.append(
                "quantidade",
                String(form.quantidade)
            );

            dados.append(
                "dataVenc",
                form.dataVenc
            );

            dados.append(
                "imagem",
                form.imagem
            );

                        const resposta = await codiguitos_api.post("/produtos", dados, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });

                        const data = resposta?.data || {};

                        const mensagemBase = (
                            data?.message ||
                            "Produto cadastrado com sucesso!"
                        ).trim();

                        const sucessoTexto = data?.notaFiscal
                            ? `${mensagemBase}${mensagemBase.endsWith(".") ? "" : "."} Nota fiscal gerada.`
                            : mensagemBase;

                        setMensagem({ type: "success", text: sucessoTexto });

                        // Define notaFiscal apenas se presente na resposta
                        if (data.notaFiscal) setNotaFiscal(data.notaFiscal);

                        // Tenta abrir o PDF — se falhar, anexa aviso à mensagem de sucesso
                        if (data.pdf) {
                            try {
                                abrirPDF(data.pdf);
                            } catch (err) {
                                console.error("Erro ao abrir PDF:", err);
                                setMensagem((anterior) => ({
                                    type: anterior?.type === "success" ? "success" : "error",
                                    text: anterior?.text
                                        ? `${anterior.text} A nota foi gerada, mas não foi possível abrir o PDF.`
                                        : "A nota foi gerada, mas não foi possível abrir o PDF.",
                                }));
                            }
                        }

                        setForm(estadoInicial);

        } catch (error) {

            console.error(error);

            setMensagem({

                type: "error",

                text: formatErrorMessage(
                    error,
                    "Erro ao cadastrar produto. Verifique os dados do formulário e tente novamente."
                )

            });

        } finally {

            setLoading(false);

        }
    }

    return (

        <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>

            <Sidebar />

            <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>

                <header style={styles.header}>

                    <h2 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>
                        Cadastro de Produtos
                    </h2>

                    <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                        Adicione novos itens ao estoque da adega.
                    </p>

                </header>

                <section style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>

                    <AlertMessage
                        type={mensagem.type}
                        message={mensagem.text}
                        dark={isDark}
                    />

                    <form
                        onSubmit={cadastrarProduto}
                        style={styles.form}
                    >

                        <div style={styles.grid}>

                            <label style={{ ...styles.field, ...(isDark ? styles.fieldDark : {}) }}>
                                <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                                    Fornecedor
                                </span>
                                <select
                                    name="idFornecedor"
                                    value={form.idFornecedor}
                                    onChange={atualizarCampo}
                                    disabled={carregandoFornecedores || fornecedores.length === 0}
                                    style={{ ...styles.select, ...(isDark ? styles.selectDark : {}) }}
                                >
                                    <option value="">
                                        {carregandoFornecedores
                                            ? "Carregando fornecedores..."
                                            : fornecedores.length === 0
                                            ? "Nenhum fornecedor cadastrado"
                                            : "Selecione um fornecedor..."}
                                    </option>
                                    {fornecedores
                                        .filter((fornecedor) => {
                                            const id = fornecedor.Id ?? fornecedor.id;
                                            const nome = fornecedor.Nome ?? fornecedor.nome;
                                            return id && nome;
                                        })
                                        .map((fornecedor) => {
                                            const id = fornecedor.Id ?? fornecedor.id;
                                            const nome = fornecedor.Nome ?? fornecedor.nome;
                                            return (
                                                <option key={id} value={id}>
                                                    {nome}
                                                </option>
                                            );
                                        })}
                                </select>
                            </label>

                            <FormField
                                label="Nome do produto"
                                name="nome"
                                placeholder="Ex: Vinho Tinto"
                                value={form.nome}
                                onChange={atualizarCampo}
                                dark={isDark}
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
                                dark={isDark}
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
                                dark={isDark}
                            />

                            <FormField
                                label="Data de vencimento"
                                name="dataVenc"
                                type="date"
                                value={form.dataVenc}
                                onChange={atualizarCampo}
                                dark={isDark}
                            />

                            <label style={{ ...styles.field, ...(isDark ? styles.fieldDark : {}) }}>

                                <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                                    Imagem do produto
                                </span>

                                <input
                                    type="file"
                                    name="imagem"
                                    accept="image/png,image/jpeg"
                                    onChange={atualizarCampo}
                                    style={{ ...styles.fileInput, ...(isDark ? styles.fileInputDark : {}) }}
                                />

                            </label>

                        </div>

                        <div style={styles.actions}>

                            <PrimaryButton
                                disabled={loading}
                            >

                                {loading
                                    ? "Cadastrando..."
                                    : "Cadastrar produto"
                                }

                            </PrimaryButton>

                        </div>

                    </form>

                    {notaFiscal && (

                        <div style={{ ...styles.nota, ...(isDark ? styles.notaDark : {}) }}>

                            <div style={{ ...styles.notaHeader, ...(isDark ? styles.notaHeaderDark : {}) }}>

                                <div>

                                    <h3 style={{ ...styles.notaTitle, ...(isDark ? styles.notaTitleDark : {}) }}>
                                        Nota Fiscal
                                    </h3>

                                    <p style={{ ...styles.notaNumero, ...(isDark ? styles.notaNumeroDark : {}) }}>
                                        Nº {notaFiscal.numero}
                                    </p>

                                </div>

                                <span style={{ ...styles.notaStatus, ...(isDark ? styles.notaStatusDark : {}) }}>
                                    Gerada
                                </span>

                            </div>

                            <div style={{ ...styles.notaLinha, ...(isDark ? styles.notaLinhaDark : {}) }}>

                                <span>
                                    Data de emissão
                                </span>

                                <strong>
                                    {new Date(
                                        notaFiscal.dataEmissao
                                    ).toLocaleString("pt-BR")}
                                </strong>

                            </div>

                            <div style={{ ...styles.notaLinha, ...(isDark ? styles.notaLinhaDark : {}) }}>

                                <span>
                                    Produto
                                </span>

                                <strong>
                                    {notaFiscal.produto.nome}
                                </strong>

                            </div>

                            <div style={{ ...styles.notaLinha, ...(isDark ? styles.notaLinhaDark : {}) }}>

                                <span>
                                    Quantidade
                                </span>

                                <strong>
                                    {notaFiscal.produto.quantidade}
                                </strong>

                            </div>

                            <div style={{ ...styles.notaLinha, ...(isDark ? styles.notaLinhaDark : {}) }}>

                                <span>
                                    Preço unitário
                                </span>

                                <strong>
                                    {Number(
                                        notaFiscal.produto.precoUnitario
                                    ).toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL"
                                        }
                                    )}
                                </strong>

                            </div>

                            <div style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}>

                                <span>
                                    TOTAL
                                </span>

                                <strong>
                                    {Number(
                                        notaFiscal.produto.valorTotal
                                    ).toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL"
                                        }
                                    )}
                                </strong>

                            </div>

                            <p style={{ ...styles.avisoNota, ...(isDark ? styles.avisoNotaDark : {}) }}>
                                Esta nota fiscal foi gerada
                                automaticamente e não foi salva
                                no banco de dados.
                            </p>

                        </div>

                    )}

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

    layoutDark: {
        backgroundColor: "#0f172a",
    },

    page: {
        marginLeft: "256px",
        width: "calc(100% - 256px)",
        padding: "32px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
    },

    pageDark: {
        backgroundColor: "#111827",
        color: "#f3f4f6",
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

    titleDark: {
        color: "#f9fafb",
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#4a5568",
    },

    subtitleDark: {
        color: "#d1d5db",
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
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "20px",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    fieldDark: {
        color: "#e5e7eb",
    },

    label: {
        fontWeight: 600,
        color: "#303e51",
    },

    labelDark: {
        color: "#e5e7eb",
    },

    fileInput: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px dashed #cbd5e1",
        borderRadius: "10px",
        padding: "12px",
        backgroundColor: "#f8fafc",
        color: "#111827",
    },

    fileInputDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb",
    },

    actions: {
        display: "flex",
        justifyContent: "flex-end",
    },

    nota: {
        marginTop: "32px",
        padding: "24px",
        border: "2px solid #e2e8f0",
        borderRadius: "12px",
        backgroundColor: "#f8fafc",
    },

    notaDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
    },

    notaHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: "16px",
        marginBottom: "16px",
    },

    notaHeaderDark: {
        borderBottomColor: "#4b5563",
    },

    notaTitle: {
        margin: 0,
        fontSize: "24px",
        color: "#111c2d",
    },

    notaTitleDark: {
        color: "#f9fafb",
    },

    notaNumero: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "14px",
    },

    notaNumeroDark: {
        color: "#cbd5e1",
    },

    notaStatus: {
        padding: "6px 12px",
        borderRadius: "20px",
        backgroundColor: "#dcfce7",
        color: "#166534",
        fontSize: "13px",
        fontWeight: 600,
    },

    notaStatusDark: {
        backgroundColor: "#064e3b",
        color: "#d1fae5",
    },

    notaLinha: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #e2e8f0",
        color: "#475569",
    },

    notaLinhaDark: {
        borderBottomColor: "#ffffff",
        color: "#e5e7eb",
    },

    total: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "18px",
        paddingTop: "18px",
        fontSize: "20px",
        color: "#ffffff",
    },

    totalDark: {
        color: "#f9fafb",
    },

    avisoNota: {
        margin: "20px 0 0",
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: "#fff7ed",
        color: "#9a3412",
        fontSize: "13px",
        textAlign: "center",
    },

    avisoNotaDark: {
        backgroundColor: "#3f2715",
        color: "#fed7aa",
    },

    select: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "12px",
        backgroundColor: "#f8fafc",
        color: "#111827",
        fontSize: "16px",
    },

    selectDark: {
        backgroundColor: "#1f2937",
        borderColor: "#374151",
        color: "#f9fafb",
    },
};
