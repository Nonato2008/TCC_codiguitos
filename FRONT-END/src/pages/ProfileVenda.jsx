import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVendaById } from "../hooks/useVendasById";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../contexts/ThemeContext";
import {
    ArrowLeft,
    BadgeCheck,
    CalendarClock,
    CreditCard,
    Hash,
    Package2,
    Printer,
    ReceiptText,
    Trash2,
    UserRound,
    Wallet,
} from "lucide-react";
import { cancelarVenda } from "../services/vendasService";

export default function ProfileVenda() {

    // Pega o `id` da venda direto da URL (ex: /vendas/:id)
    const { id } = useParams();

    const navigate = useNavigate();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const [cancelando, setCancelando] = useState(false);

    // Hook customizado que busca a venda pelo id
    const {
        venda,
        loading,
        error
    } = useVendaById(id);

    async function handleCancelarVenda() {
        const { default: Swal } = await import("sweetalert2");
        const confirmacao = await Swal.fire({
            icon: "warning",
            title: "Cancelar esta venda?",
            text: "A venda será removida e os produtos voltarão ao estoque.",
            showCancelButton: true,
            confirmButtonText: "Cancelar venda e estornar estoque",
            cancelButtonText: "Manter venda",
            confirmButtonColor: "#a41623",
            reverseButtons: true,
        });

        if (!confirmacao.isConfirmed) return;

        try {
            setCancelando(true);
            await cancelarVenda(id);
            await Swal.fire({
                icon: "success",
                title: "Venda cancelada",
                text: "A venda foi removida e o estoque foi atualizado.",
                confirmButtonColor: "#a41623",
            });
            navigate("/vendas", { replace: true });
        } catch (cancelError) {
            await Swal.fire({
                icon: "error",
                title: "Não foi possível cancelar",
                text: cancelError.response?.data?.message || "Ocorreu um erro ao cancelar a venda.",
                confirmButtonColor: "#a41623",
            });
        } finally {
            setCancelando(false);
        }
    }

    // Estado de carregamento
    if (loading) {
        return (
            <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
                <Sidebar />

                <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                    <p style={{ ...styles.loading, ...(isDark ? styles.loadingDark : {}) }}>
                        Carregando informações da venda...
                    </p>
                </main>
            </div>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
                <Sidebar />

                <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                    <div style={{ ...styles.error, ...(isDark ? styles.errorDark : {}) }}>
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    // Venda não encontrada (id inválido ou inexistente)
    if (!venda) {
        return (
            <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
                <Sidebar />

                <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                    <div style={{ ...styles.error, ...(isDark ? styles.errorDark : {}) }}>
                        Venda não encontrada.
                    </div>
                </main>
            </div>
        );
    }

    // Lista de itens da venda (fallback para array vazio)
    const itens = venda.Itens || [];
    const totalItens = itens.reduce((total, item) => total + Number(item.Qtd ?? item.quantidade ?? 0) * Number(item.Valor ?? item.valor ?? 0), 0);

    return (
        <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>

            <Sidebar />

            <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>

                <div className="sale-detail-toolbar">
                    <button type="button" className="sale-back-button" onClick={() => navigate("/vendas")}>
                        <ArrowLeft size={17} aria-hidden="true" />
                        Voltar para vendas
                    </button>
                    <div className="sale-detail-actions">
                        <button type="button" className="sale-print-button" onClick={() => window.print()}>
                            <Printer size={17} aria-hidden="true" />
                            Imprimir recibo
                        </button>
                        <button type="button" className="sale-cancel-button" onClick={handleCancelarVenda} disabled={cancelando}>
                            <Trash2 size={16} aria-hidden="true" />
                            {cancelando ? "Cancelando..." : "Cancelar venda"}
                        </button>
                    </div>
                </div>

                <header className="sale-detail-heading">
                    <div>
                        <span className="sale-detail-eyebrow">RECIBO DE VENDA</span>
                        <h1>Detalhes da venda <span className="sale-detail-status"><BadgeCheck size={15} aria-hidden="true" /> Registrada</span></h1>
                        <p>Venda #{venda.Id}</p>
                    </div>
                </header>


                {/* INFORMAÇÕES DA VENDA */}
                <section className="sale-detail-overview" style={{ ...styles.infoCard, ...(isDark ? styles.infoCardDark : {}) }}>

                    <div style={styles.infoItem}>
                        <span className="sale-detail-info-label" style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            <Hash size={15} aria-hidden="true" /> Nº da Venda
                        </span>

                        <strong style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {venda.Id}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span className="sale-detail-info-label" style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            <UserRound size={15} aria-hidden="true" /> Vendedor
                        </span>

                        <strong style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {venda.NomeVendedor ||
                                `Vendedor #${venda.IdVendedor}`}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span className="sale-detail-info-label" style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            <CalendarClock size={15} aria-hidden="true" /> Data e hora
                        </span>

                        <strong style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {formatarDataCompleta(venda.DataCad)}
                        </strong>
                    </div>

                    <div style={styles.infoItem}>
                        <span className="sale-detail-info-label" style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            <CreditCard size={15} aria-hidden="true" /> Forma de pagamento
                        </span>
                        <strong className="sale-detail-payment" style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {venda.formaPagamento ?? venda.FormaPagamento ?? "Não informada"}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span className="sale-detail-info-label" style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            <Wallet size={15} aria-hidden="true" /> Valor total
                        </span>

                        <strong className="sale-detail-overview-total" style={{ ...styles.totalValue, ...(isDark ? styles.totalValueDark : {}) }}>
                            R$ {formatarMoeda(venda.ValorTotal)}
                        </strong>
                    </div>

                </section>


                {/* PRODUTOS */}
                <section className="sale-detail-products" style={{ ...styles.productsCard, ...(isDark ? styles.productsCardDark : {}) }}>

                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={{ ...styles.sectionTitle, ...(isDark ? styles.sectionTitleDark : {}) }}>
                                Produtos da venda
                            </h2>

                            <p style={{ ...styles.sectionSubtitle, ...(isDark ? styles.sectionSubtitleDark : {}) }}>
                                {itens.length}{" "}
                                {itens.length === 1
                                    ? "produto"
                                    : "produtos"}
                            </p>
                        </div>
                    </div>


                    {itens.length === 0 ? (

                        <div style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                            <p>
                                Nenhum produto encontrado nesta venda.
                            </p>
                        </div>

                    ) : (

                        <div style={styles.tableContainer}>

                            <table className="sale-detail-table" style={styles.table}>

                                <thead>
                                    <tr>
                                        <th style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Produto
                                        </th>

                                        <th style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Quantidade
                                        </th>

                                        <th className="sale-detail-money-heading" style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Valor unitário
                                        </th>

                                        <th className="sale-detail-money-heading" style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {itens.map((item) => {

                                        // Cada item da venda tem quantidade e valor unitário
                                        const quantidade = Number(item.Qtd ?? item.quantidade ?? 0);

                                        const valor = Number(item.Valor ?? item.valor ?? 0);

                                        // Subtotal calculado no front
                                        const subtotal =
                                            quantidade * valor;

                                        return (
                                            <tr key={item.Id}>

                                                <td style={{ ...styles.td, ...(isDark ? styles.tdDark : {}) }}>
                                                    <div className="sale-product-cell">
                                                        {getImagemProduto(item.ImagemProduto) ? (
                                                            <img className="sale-product-thumbnail" src={getImagemProduto(item.ImagemProduto)} alt="" />
                                                        ) : (
                                                            <span className="sale-product-placeholder"><Package2 size={18} aria-hidden="true" /></span>
                                                        )}
                                                        <strong>{item.NomeProduto || `Produto #${item.IdProduto}`}</strong>
                                                    </div>
                                                </td>


                                                <td style={{ ...styles.td, ...(isDark ? styles.tdDark : {}) }}>
                                                    {quantidade}
                                                </td>


                                                <td className="sale-detail-money" style={{ ...styles.td, ...(isDark ? styles.tdDark : {}) }}>
                                                    R$ {formatarMoeda(valor)}
                                                </td>


                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        ...(isDark ? styles.tdDark : {}),
                                                        fontWeight: "700"
                                                    }}
                                                    className="sale-detail-money"
                                                >
                                                    R$ {formatarMoeda(subtotal)}
                                                </td>

                                            </tr>
                                        );

                                    })}

                                </tbody>

                                <tfoot>
                                    <tr>
                                        <th colSpan="3">Total dos itens</th>
                                        <th className="sale-detail-money">R$ {formatarMoeda(totalItens)}</th>
                                    </tr>
                                </tfoot>

                            </table>

                        </div>

                    )}

                </section>


                {/* RESUMO */}
                <section className="sale-detail-total" style={{ ...styles.summary, ...(isDark ? styles.summaryDark : {}) }}>
                    <div className="sale-detail-total-main">
                        <span className="sale-detail-total-label"><ReceiptText size={17} aria-hidden="true" /> Total da venda</span>
                        <strong className="sale-detail-total-amount" style={{ ...styles.summaryValue, ...(isDark ? styles.summaryValueDark : {}) }}>
                            R$ {formatarMoeda(venda.ValorTotal)}
                        </strong>
                    </div>
                    <div className="sale-detail-payment-meta">
                        <div>
                            <span>Forma de pagamento</span>
                            <strong>{venda.formaPagamento ?? venda.FormaPagamento ?? "Não informada"}</strong>
                        </div>
                        <div>
                            <span>Troco</span>
                            <strong>{String(venda.formaPagamento ?? venda.FormaPagamento ?? "").toLowerCase() === "dinheiro" ? "Valor recebido não informado" : "Não se aplica"}</strong>
                        </div>
                    </div>
                </section>

                {(venda.Observacoes ?? venda.observacoes) && (
                    <section className="sale-detail-notes">
                        <h2>Observações</h2>
                        <p>{venda.Observacoes ?? venda.observacoes}</p>
                    </section>
                )}

            </main>

        </div>
    );
}


function formatarDataCompleta(data) {
    if (!data) return "—";
    const parsed = new Date(data);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getImagemProduto(imagem) {
    if (!imagem) return null;
    if (/^https?:\/\//i.test(imagem)) return imagem;
    return `http://localhost:8000${imagem.startsWith("/") ? imagem : `/${imagem}`}`;
}

// FORMATA DINHEIRO
function formatarMoeda(valor) {
    return Number(valor || 0)
        .toFixed(2)
        .replace(".", ",");
}


const styles = {

    layout: {
        minHeight: "100vh",
        backgroundColor: "#f5f6f8",
    },

    layoutDark: {
        backgroundColor: "#0f172a",
    },

    page: {
        marginLeft: "363px",
        minHeight: "100vh",
        padding: "25px 25px",
        boxSizing: "border-box",
    },

    pageDark: {
        backgroundColor: "#111827",
        color: "#f3f4f6",
    },

    header: {
        maxWidth: "1150px",
        marginBottom: "20px",
    },

    backButton: {
        padding: "7px 13px",
        border: "1px solid #ddd",
        borderRadius: "7px",
        backgroundColor: "#fff",
        color: "#333",
        cursor: "pointer",
        fontSize: "14px",
        marginBottom: "12px",
    },

    backButtonDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb",
    },

    title: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "700",
        color: "#243447",
    },

    subtitle: {
        marginTop: "5px",
        marginBottom: 0,
        fontSize: "14px",
        color: "#718096",
    },

    subtitleDark: {
        color: "#d1d5db",
    },

    infoCard: {
        width: "100%",
        maxWidth: "1150px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "18px 20px",
        marginBottom: "18px",
        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box",
    },

    infoCardDark: {
        backgroundColor: "#1f2937",
        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.2)",
    },

    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    label: {
        color: "#777",
        fontSize: "13px",
    },

    labelDark: {
        color: "#cbd5e1",
    },

    value: {
        color: "#1f2937",
        fontSize: "16px",
    },

    valueDark: {
        color: "#f9fafb",
    },

    totalValue: {
        color: "#303e51",
        fontSize: "18px",
    },

    totalValueDark: {
        color: "#10b981",
    },

    productsCard: {
        width: "100%",
        maxWidth: "1150px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box",
    },

    productsCardDark: {
        backgroundColor: "#1f2937",
        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.2)",
    },

    sectionHeader: {
        marginBottom: "15px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "20px",
        color: "#243447",
    },

    sectionTitleDark: {
        color: "#f9fafb",
    },

    sectionSubtitle: {
        marginTop: "4px",
        marginBottom: 0,
        color: "#777",
        fontSize: "14px",
    },

    sectionSubtitleDark: {
        color: "#cbd5e1",
    },

    tableContainer: {
        width: "100%",
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    th: {
        textAlign: "left",
        padding: "11px 12px",
        backgroundColor: "#f8f9fa",
        borderBottom: "2px solid #ddd",
        color: "#444",
        fontSize: "13px",
    },

    thDark: {
        backgroundColor: "#111827",
        borderBottomColor: "#4b5563",
        color: "#e5e7eb",
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #eee",
        color: "#444",
        fontSize: "14px",
    },

    tdDark: {
        borderBottomColor: "#4b5563",
        color: "#f9fafb",
    },

    empty: {
        textAlign: "center",
        padding: "30px",
        color: "#777",
    },

    emptyDark: {
        color: "#cbd5e1",
    },

    summary: {
        width: "100%",
        maxWidth: "1150px",
        marginTop: "18px",
        padding: "17px 20px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box",
    },

    summaryDark: {
        backgroundColor: "#1f2937",
        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.2)",
    },

    summaryLabel: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#444",
    },

    summaryLabelDark: {
        color: "#cbd5e1",
    },

    summaryValue: {
        fontSize: "21px",
        color: "#18a937",
    },

    summaryValueDark: {
        color: "#10b981",
    },

    loading: {
        fontSize: "16px",
        color: "#666",
    },

    loadingDark: {
        color: "#cbd5e1",
    },

    error: {
        padding: "18px",
        backgroundColor: "#ffe5e5",
        color: "#b00020",
        borderRadius: "8px",
    },

    errorDark: {
        backgroundColor: "#3f1721",
        color: "#fecdd3",
    },
};