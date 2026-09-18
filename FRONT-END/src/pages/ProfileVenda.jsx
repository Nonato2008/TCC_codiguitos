import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVendaById } from "../hooks/useVendasById";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../contexts/ThemeContext";

export default function ProfileVenda() {

    // Pega o `id` da venda direto da URL (ex: /vendas/:id)
    const { id } = useParams();

    const navigate = useNavigate();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    // Hook customizado que busca a venda pelo id
    const {
        venda,
        loading,
        error
    } = useVendaById(id);

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

    return (
        <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>

            <Sidebar />

            <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>

                {/* CABEÇALHO */}
                <div style={styles.header}>

                    <div>
                        <button
                            onClick={() => navigate("/vendas")}
                            style={{ ...styles.backButton, ...(isDark ? styles.backButtonDark : {}) }}
                        >
                            ← Voltar
                        </button>

                        <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                            Detalhes da venda
                        </p>
                    </div>

                </div>


                {/* INFORMAÇÕES DA VENDA */}
                <section style={{ ...styles.infoCard, ...(isDark ? styles.infoCardDark : {}) }}>

                    <div style={styles.infoItem}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Nº da Venda
                        </span>

                        <strong style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {venda.Id}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Vendedor
                        </span>

                        <strong style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {venda.NomeVendedor ||
                                `Vendedor #${venda.IdVendedor}`}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Data da Venda
                        </span>

                        <strong style={{ ...styles.value, ...(isDark ? styles.valueDark : {}) }}>
                            {formatarData(venda.DataCad)}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Valor Total
                        </span>

                        <strong style={{ ...styles.totalValue, ...(isDark ? styles.totalValueDark : {}) }}>
                            R$ {formatarMoeda(venda.ValorTotal)}
                        </strong>
                    </div>

                </section>


                {/* PRODUTOS */}
                <section style={{ ...styles.productsCard, ...(isDark ? styles.productsCardDark : {}) }}>

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

                            <table style={styles.table}>

                                <thead>
                                    <tr>
                                        <th style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Produto
                                        </th>

                                        <th style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Quantidade
                                        </th>

                                        <th style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Valor unitário
                                        </th>

                                        <th style={{ ...styles.th, ...(isDark ? styles.thDark : {}) }}>
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {itens.map((item) => {

                                        // Cada item da venda tem quantidade e valor unitário
                                        const quantidade =
                                            Number(item.Qtd);

                                        const valor =
                                            Number(item.Valor);

                                        // Subtotal calculado no front
                                        const subtotal =
                                            quantidade * valor;

                                        return (
                                            <tr key={item.Id}>

                                                <td style={{ ...styles.td, ...(isDark ? styles.tdDark : {}) }}>
                                                    <strong>
                                                        {item.NomeProduto ||
                                                            `Produto #${item.IdProduto}`}
                                                    </strong>
                                                </td>


                                                <td style={{ ...styles.td, ...(isDark ? styles.tdDark : {}) }}>
                                                    {quantidade}
                                                </td>


                                                <td style={{ ...styles.td, ...(isDark ? styles.tdDark : {}) }}>
                                                    R$ {formatarMoeda(valor)}
                                                </td>


                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        ...(isDark ? styles.tdDark : {}),
                                                        fontWeight: "700"
                                                    }}
                                                >
                                                    R$ {formatarMoeda(subtotal)}
                                                </td>

                                            </tr>
                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* RESUMO */}
                <section style={{ ...styles.summary, ...(isDark ? styles.summaryDark : {}) }}>

                    <div>
                        <span style={{ ...styles.summaryLabel, ...(isDark ? styles.summaryLabelDark : {}) }}>
                            Total da venda
                        </span>
                    </div>

                    <strong style={{ ...styles.summaryValue, ...(isDark ? styles.summaryValueDark : {}) }}>
                        R$ {formatarMoeda(venda.ValorTotal)}
                    </strong>

                </section>

            </main>

        </div>
    );
}


// FORMATA DATA
function formatarData(data) {
    if (!data) {
        return "-";
    }

    return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
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