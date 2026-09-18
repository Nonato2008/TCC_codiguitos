import { Link } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { useVendas } from "../hooks/useVendas";
import { buscarVendedores } from "../services/vendedoresService";
import VendasList from "../components/VendasList";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Vendas() {
    const { vendas, loading, error } = useVendas();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [vendedores, setVendedores] = useState([]);
    const [dataFiltro, setDataFiltro] = useState("");

    useEffect(() => {
        const carregarVendedores = async () => {
            try {
                const dados = await buscarVendedores();
                setVendedores(dados || []);
            } catch (error) {
                console.error("Erro ao buscar vendedores:", error);
            }
        };

        carregarVendedores();
    }, []);

    const encontrarNomeVendedor = (idVendedor) => {
        const vendedor = vendedores.find((v) => v.Id === idVendedor || v.id === idVendedor);
        return vendedor ? vendedor.Nome ?? vendedor.nome : `Vendedor #${idVendedor}`;
    };

    const vendasComVendedor = (Array.isArray(vendas) ? vendas : []).map((venda) => ({
        ...venda,
        NomeVendedor: encontrarNomeVendedor(venda.IdVendedor),
    }));

    const formatarDataLocal = (data) => {
        const dataLocal = new Date(data);
        if (Number.isNaN(dataLocal.getTime())) return "";

        const offset = dataLocal.getTimezoneOffset();
        const localDate = new Date(dataLocal.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 10);
    };

    const vendasFiltradas = vendasComVendedor.filter((venda) => {
        if (!dataFiltro) return true;

        const dataVenda = venda.DataCad ?? venda.dataCad ?? venda.Data;
        const dataVendaFormatada = formatarDataLocal(dataVenda);

        return dataVendaFormatada === dataFiltro;
    });

    if (loading) {
        return (
            <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
                <Sidebar />

                <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                    <header style={styles.header}>
                        <div>
                            <h1 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>Vendas</h1>
                            <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>Consulte as vendas realizadas na loja.</p>
                        </div>

                        <div style={styles.headerRight}>
                            <div style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}>0 vendas</div>
                            <Link to="/vendas/cadastrar" style={{ textDecoration: "none" }}>
                                <button style={{ ...styles.primaryButton, ...(isDark ? styles.primaryButtonDark : {}) }}>+ Nova venda</button>
                            </Link>
                        </div>
                    </header>

                    <div style={styles.centerContent}>
                        <p style={{ ...(isDark ? styles.textDark : {}) }}>Carregando vendas...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
                <Sidebar />

                <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                    <header style={styles.header}>
                        <div>
                            <h1 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>Vendas</h1>
                            <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>Consulte as vendas realizadas na loja.</p>
                        </div>

                        <div style={styles.headerRight}>
                            <div style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}>0 vendas</div>
                            <Link to="/vendas/cadastrar" style={{ textDecoration: "none" }}>
                                <button style={{ ...styles.primaryButton, ...(isDark ? styles.primaryButtonDark : {}) }}>+ Nova venda</button>
                            </Link>
                        </div>
                    </header>

                    <div style={styles.centerContent}>
                        <div style={{ ...styles.error, ...(isDark ? styles.errorDark : {}) }}>Erro ao carregar as vendas.</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
            <Sidebar />

            <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                <header style={styles.header}>
                    <div>
                        <h1 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>Vendas</h1>
                        <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>Consulte as vendas realizadas na loja.</p>
                    </div>

                    <div style={styles.headerRight}>
                        <div style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}>
                            {vendasFiltradas.length} {" "}
                            {vendasFiltradas.length === 1 ? "venda" : "vendas"}
                        </div>

                        <input
                            type="date"
                            value={dataFiltro}
                            onChange={(event) => setDataFiltro(event.target.value)}
                            style={{
                                ...styles.dateInput,
                                ...(isDark ? styles.dateInputDark : {}),
                            }}
                            aria-label="Filtrar vendas por data"
                        />

                        {dataFiltro && (
                            <button
                                type="button"
                                onClick={() => setDataFiltro("")}
                                style={{
                                    ...styles.clearFilterButton,
                                    ...(isDark ? styles.clearFilterButtonDark : {}),
                                }}
                            >
                                Limpar
                            </button>
                        )}

                        <Link to="/vendas/cadastrar" style={{ textDecoration: "none" }}>
                            <button style={{ ...styles.primaryButton, ...(isDark ? styles.primaryButtonDark : {}) }}>+ Nova venda</button>
                        </Link>
                    </div>
                </header>

                <section style={styles.content}>
                    {vendasFiltradas.length === 0 ? (
                        <div style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                            <span className="material-symbols-outlined">point_of_sale</span>
                            <p style={{ ...(isDark ? styles.textDark : {}) }}>
                                {dataFiltro ? "Nenhuma venda encontrada para a data selecionada." : "Nenhuma venda encontrada."}
                            </p>
                        </div>
                    ) : (
                        <VendasList vendas={vendasFiltradas} />
                    )}
                </section>
            </main>
        </div>
    );
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
        padding: "30px 25px",
        boxSizing: "border-box",
    },
    pageDark: {
        backgroundColor: "#111827",
    },
    header: {
        maxWidth: "1150px",
        margin: "0 0 25px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },
    title: {
        margin: 0,
        fontSize: "32px",
        fontWeight: "700",
        color: "#243447",
    },
    titleDark: {
        color: "#f9fafb",
    },
    subtitle: {
        marginTop: "7px",
        marginBottom: 0,
        fontSize: "15px",
        color: "#718096",
    },
    subtitleDark: {
        color: "#d1d5db",
    },
    total: {
        backgroundColor: "#ffffff",
        padding: "10px 18px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        color: "#243447",
        fontWeight: "600",
        fontSize: "15px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
    },
    totalDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb",
    },
    primaryButton: {
        border: "none",
        backgroundColor: "#303e51",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "10px",
        fontWeight: 600,
        cursor: "pointer",
    },
    primaryButtonDark: {
        backgroundColor: "#2563eb",
    },
    content: {
        width: "100%",
        maxWidth: "1150px",
        margin: "0",
    },
    centerContent: {
        maxWidth: "1150px",
        margin: "0",
    },
    empty: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "50px",
        textAlign: "center",
        color: "#718096",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },
    emptyDark: {
        backgroundColor: "#1f2937",
        color: "#d1d5db",
    },
    error: {
        backgroundColor: "#ffe5e5",
        color: "#b00020",
        padding: "20px",
        borderRadius: "10px",
    },
    errorDark: {
        backgroundColor: "#3f1721",
        color: "#fecdd3",
    },
    textDark: {
        color: "#e5e7eb",
    },
    dateInput: {
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "9px 10px",
        backgroundColor: "#ffffff",
        color: "#243447",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        outline: "none",
    },
    dateInputDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb",
    },
    clearFilterButton: {
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "9px 10px",
        backgroundColor: "#f8fafc",
        color: "#243447",
        fontWeight: 600,
        fontSize: "13px",
        cursor: "pointer",
    },
    clearFilterButtonDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb",
    },
};