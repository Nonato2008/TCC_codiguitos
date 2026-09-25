import { Link } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { useVendas } from "../hooks/useVendas";
import { buscarVendedores } from "../services/vendedoresService";
import VendasList from "../components/VendasList";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Vendas() {

    // Hook que carrega a lista de vendas
    const { vendas, loading, error } = useVendas();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    // Lista de vendedores (para mostrar o nome a partir do IdVendedor)
    const [vendedores, setVendedores] = useState([]);

    // Filtro de data (input do tipo date)
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState("");

    const opcoesFormaPagamento = ["Crédito", "Débito", "Pix", "Dinheiro"];

    // Busca os vendedores uma única vez ao montar o componente
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

    // Descobre o nome do vendedor a partir do id (aceita Id/id, Nome/nome)
    const encontrarNomeVendedor = (idVendedor) => {
        const vendedor = vendedores.find((v) => v.Id === idVendedor || v.id === idVendedor);
        return vendedor ? vendedor.Nome ?? vendedor.nome : `Vendedor #${idVendedor}`;
    };

    // Enriquece cada venda com o nome do vendedor
    const vendasComVendedor = (Array.isArray(vendas) ? vendas : []).map((venda) => ({
        ...venda,
        NomeVendedor: encontrarNomeVendedor(venda.IdVendedor),
    }));

    // Converte uma data para o formato YYYY-MM-DD respeitando o fuso local
    // (usado para comparar com o valor do input type="date")
    const formatarDataLocal = (data) => {
        const dataLocal = new Date(data);
        if (Number.isNaN(dataLocal.getTime())) return "";

        const offset = dataLocal.getTimezoneOffset();
        const localDate = new Date(dataLocal.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 10);
    };

    const normalizarFormaPagamento = (valor) => {
        return String(valor ?? "").trim().toLowerCase();
    };

    // Filtra as vendas pela data selecionada (se houver filtro)
    const vendasFiltradas = vendasComVendedor.filter((venda) => {
        const dataVenda = venda.DataCad ?? venda.dataCad ?? venda.Data;
        const dataVendaFormatada = formatarDataLocal(dataVenda);

        if (dataInicio && dataVendaFormatada && dataVendaFormatada < dataInicio) return false;
        if (dataFim && dataVendaFormatada && dataVendaFormatada > dataFim) return false;

        if (formaPagamentoFiltro) {
            const pagamentoVenda =
                venda.formaPagamento ??
                venda.FormaPagamento ??
                venda.forma_pagamento ??
                venda.formaDePagamento ??
                "";

            if (normalizarFormaPagamento(pagamentoVenda) !== normalizarFormaPagamento(formaPagamentoFiltro)) {
                return false;
            }
        }

        return true;
    });

    const faturamentoPeriodo = vendasFiltradas.reduce((total, venda) => {
        return total + Number(venda.ValorTotal || 0);
    }, 0);

    const limparFiltros = () => {
        setDataInicio("");
        setDataFim("");
        setFormaPagamentoFiltro("");
    };

    // Estado de carregamento
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

    // Estado de erro
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
                            value={dataInicio}
                            onChange={(event) => setDataInicio(event.target.value)}
                            style={{
                                ...styles.dateInput,
                                ...(isDark ? styles.dateInputDark : {}),
                            }}
                            aria-label="Data inicial do filtro"
                        />

                        <input
                            type="date"
                            value={dataFim}
                            onChange={(event) => setDataFim(event.target.value)}
                            style={{
                                ...styles.dateInput,
                                ...(isDark ? styles.dateInputDark : {}),
                            }}
                            aria-label="Data final do filtro"
                        />

                        <select
                            value={formaPagamentoFiltro}
                            onChange={(event) => setFormaPagamentoFiltro(event.target.value)}
                            style={{
                                ...styles.selectInput,
                                ...(isDark ? styles.selectInputDark : {}),
                            }}
                            aria-label="Filtrar vendas por forma de pagamento"
                        >
                            <option value="">Todas as formas</option>
                            {opcoesFormaPagamento.map((forma) => (
                                <option key={forma} value={forma}>
                                    {forma}
                                </option>
                            ))}
                        </select>

                        {(dataInicio || dataFim || formaPagamentoFiltro) && (
                            <button
                                type="button"
                                onClick={limparFiltros}
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

                <section style={styles.summaryBar}>
                    <div style={{ ...styles.summaryBox, ...(isDark ? styles.summaryBoxDark : {}) }}>
                        <span style={{ ...styles.summaryLabel, ...(isDark ? styles.summaryLabelDark : {}) }}>
                            Faturamento do período
                        </span>
                        <strong style={{ ...styles.summaryValue, ...(isDark ? styles.summaryValueDark : {}) }}>
                            R$ {faturamentoPeriodo.toFixed(2).replace(".", ",")}
                        </strong>
                    </div>
                </section>

                <section style={styles.content}>
                    {vendasFiltradas.length === 0 ? (
                        <div style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                            <span className="material-symbols-outlined">point_of_sale</span>
                            <p style={{ ...(isDark ? styles.textDark : {}) }}>
                                {dataInicio || dataFim || formaPagamentoFiltro
                                    ? "Nenhuma venda encontrada para os filtros selecionados."
                                    : "Nenhuma venda encontrada."}
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
        flexWrap: "wrap",
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
    selectInput: {
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "9px 10px",
        backgroundColor: "#ffffff",
        color: "#243447",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        outline: "none",
    },
    selectInputDark: {
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
    summaryBar: {
        maxWidth: "1150px",
        margin: "0 0 20px 0",
    },
    summaryBox: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px 20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    },
    summaryBoxDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
    },
    summaryLabel: {
        color: "#64748b",
        fontSize: "14px",
        fontWeight: 600,
    },
    summaryLabelDark: {
        color: "#d1d5db",
    },
    summaryValue: {
        color: "#111827",
        fontSize: "22px",
        fontWeight: 700,
    },
    summaryValueDark: {
        color: "#f9fafb",
    },
};