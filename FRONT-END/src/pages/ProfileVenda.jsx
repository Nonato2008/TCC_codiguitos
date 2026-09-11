import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVendaById } from "../hooks/useVendasById";
import Sidebar from "../components/Sidebar";

export default function ProfileVenda() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        venda,
        loading,
        error
    } = useVendaById(id);

    if (loading) {
        return (
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>
                    <p style={styles.loading}>
                        Carregando informações da venda...
                    </p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>
                    <div style={styles.error}>
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    if (!venda) {
        return (
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>
                    <div style={styles.error}>
                        Venda não encontrada.
                    </div>
                </main>
            </div>
        );
    }

    const itens = venda.Itens || [];

    return (
        <div style={styles.layout}>

            <Sidebar />

            <main style={styles.page}>

                {/* CABEÇALHO */}
                <div style={styles.header}>

                    <div>
                        <button
                            onClick={() => navigate("/vendas")}
                            style={styles.backButton}
                        >
                            ← Voltar
                        </button>

                        <p style={styles.subtitle}>
                            Detalhes da venda
                        </p>
                    </div>

                </div>


                {/* INFORMAÇÕES DA VENDA */}
                <section style={styles.infoCard}>

                    <div style={styles.infoItem}>
                        <span style={styles.label}>
                            Nº da Venda
                        </span>

                        <strong style={styles.value}>
                            {venda.Id}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span style={styles.label}>
                            Vendedor
                        </span>

                        <strong style={styles.value}>
                            {venda.NomeVendedor ||
                                `Vendedor #${venda.IdVendedor}`}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span style={styles.label}>
                            Data da Venda
                        </span>

                        <strong style={styles.value}>
                            {formatarData(venda.DataCad)}
                        </strong>
                    </div>


                    <div style={styles.infoItem}>
                        <span style={styles.label}>
                            Valor Total
                        </span>

                        <strong style={styles.totalValue}>
                            R$ {formatarMoeda(venda.ValorTotal)}
                        </strong>
                    </div>

                </section>


                {/* PRODUTOS */}
                <section style={styles.productsCard}>

                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>
                                Produtos da venda
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                {itens.length}{" "}
                                {itens.length === 1
                                    ? "produto"
                                    : "produtos"}
                            </p>
                        </div>
                    </div>


                    {itens.length === 0 ? (

                        <div style={styles.empty}>
                            <p>
                                Nenhum produto encontrado nesta venda.
                            </p>
                        </div>

                    ) : (

                        <div style={styles.tableContainer}>

                            <table style={styles.table}>

                                <thead>
                                    <tr>
                                        <th style={styles.th}>
                                            Produto
                                        </th>

                                        <th style={styles.th}>
                                            Quantidade
                                        </th>

                                        <th style={styles.th}>
                                            Valor unitário
                                        </th>

                                        <th style={styles.th}>
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {itens.map((item) => {

                                        const quantidade =
                                            Number(item.Qtd);

                                        const valor =
                                            Number(item.Valor);

                                        const subtotal =
                                            quantidade * valor;

                                        return (
                                            <tr key={item.Id}>

                                                <td style={styles.td}>
                                                    <strong>
                                                        {item.NomeProduto ||
                                                            `Produto #${item.IdProduto}`}
                                                    </strong>
                                                </td>


                                                <td style={styles.td}>
                                                    {quantidade}
                                                </td>


                                                <td style={styles.td}>
                                                    R$ {formatarMoeda(valor)}
                                                </td>


                                                <td
                                                    style={{
                                                        ...styles.td,
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
                <section style={styles.summary}>

                    <div>
                        <span style={styles.summaryLabel}>
                            Total da venda
                        </span>
                    </div>

                    <strong style={styles.summaryValue}>
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

    page: {
        marginLeft: "363px",
        minHeight: "100vh",
        padding: "25px 25px",
        boxSizing: "border-box",
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

    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    label: {
        color: "#777",
        fontSize: "13px",
    },

    value: {
        color: "#1f2937",
        fontSize: "16px",
    },

    totalValue: {
        color: "#303e51",
        fontSize: "18px",
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

    sectionHeader: {
        marginBottom: "15px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "20px",
        color: "#243447",
    },

    sectionSubtitle: {
        marginTop: "4px",
        marginBottom: 0,
        color: "#777",
        fontSize: "14px",
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

    td: {
        padding: "12px",
        borderBottom: "1px solid #eee",
        color: "#444",
        fontSize: "14px",
    },

    empty: {
        textAlign: "center",
        padding: "30px",
        color: "#777",
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

    summaryLabel: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#444",
    },

    summaryValue: {
        fontSize: "21px",
        color: "#18a937",
    },

    loading: {
        fontSize: "16px",
        color: "#666",
    },

    error: {
        padding: "18px",
        backgroundColor: "#ffe5e5",
        color: "#b00020",
        borderRadius: "8px",
    },
};