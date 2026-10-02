import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    LayoutGrid,
    List,
    Plus,
    RotateCcw,
    SlidersHorizontal,
    TrendingUp,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useVendas } from "../hooks/useVendas";
import { buscarVendedores } from "../services/vendedoresService";
import VendasList from "../components/VendasList";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Vendas() {

    // Hook que carrega a lista de vendas
    const { vendas, loading, error } = useVendas();

    const { theme } = React.useContext(ThemeContext);
    const isDark = theme === "dark";

    // Lista de vendedores (para mostrar o nome a partir do IdVendedor)
    const [vendedores, setVendedores] = useState([]);

    // Filtro de data (input do tipo date)
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState("");
    const [ordenacao, setOrdenacao] = useState("recentes");
    const [visualizacao, setVisualizacao] = useState("cards");
    const [pagina, setPagina] = useState(1);
    const itensPorPagina = 8;

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
        const vendedor = vendedores.find((v) => String(v.Id ?? v.id) === String(idVendedor));
        return vendedor ? vendedor.Nome ?? vendedor.nome : `Vendedor #${idVendedor}`;
    };

    // Enriquece cada venda com o nome do vendedor
    const vendasComVendedor = (Array.isArray(vendas) ? vendas : []).map((venda) => ({
        ...venda,
        NomeVendedor: encontrarNomeVendedor(venda.IdVendedor ?? venda.idVendedor),
    }));

    // Converte uma data para o formato YYYY-MM-DD respeitando o fuso local
    // (usado para comparar com o valor do input type="date")
    const formatarDataLocal = (data) => {
        const dataLocal = parseDataVenda(data);
        if (!dataLocal) return "";

        const ano = dataLocal.getFullYear();
        const mes = String(dataLocal.getMonth() + 1).padStart(2, "0");
        const dia = String(dataLocal.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    };

    const normalizarFormaPagamento = (valor) => {
        return String(valor ?? "").trim().toLowerCase();
    };

    // Filtra as vendas pela data selecionada (se houver filtro)
    const vendasFiltradas = vendasComVendedor.filter((venda) => {
        const dataVenda = venda.DataCad ?? venda.dataCad ?? venda.Data ?? venda.data;
        const dataVendaFormatada = formatarDataLocal(dataVenda);

        if (dataInicio && (!dataVendaFormatada || dataVendaFormatada < dataInicio)) return false;
        if (dataFim && (!dataVendaFormatada || dataVendaFormatada > dataFim)) return false;

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
        return total + Number(venda.ValorTotal ?? venda.valorTotal ?? 0);
    }, 0);

    const ticketMedio = vendasFiltradas.length ? faturamentoPeriodo / vendasFiltradas.length : 0;
    const formaPagamentoMaisUsada = useMemo(() => {
        const contagem = new Map();
        vendasFiltradas.forEach((venda) => {
            const forma = venda.formaPagamento ?? venda.FormaPagamento ?? venda.forma_pagamento ?? venda.formaDePagamento;
            if (forma) contagem.set(String(forma), (contagem.get(String(forma)) || 0) + 1);
        });
        return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Sem dados";
    }, [vendasFiltradas]);

    const vendasOrdenadas = useMemo(() => {
        const resultado = [...vendasFiltradas];
        const dataDaVenda = (venda) => new Date(venda.DataCad ?? venda.dataCad ?? venda.Data ?? venda.data ?? 0).getTime() || 0;
        const valorDaVenda = (venda) => Number(venda.ValorTotal ?? venda.valorTotal ?? 0);

        resultado.sort((a, b) => {
            if (ordenacao === "antigas") return dataDaVenda(a) - dataDaVenda(b);
            if (ordenacao === "maiorValor") return valorDaVenda(b) - valorDaVenda(a);
            if (ordenacao === "menorValor") return valorDaVenda(a) - valorDaVenda(b);
            return dataDaVenda(b) - dataDaVenda(a);
        });

        return resultado;
    }, [vendasFiltradas, ordenacao]);

    const totalPaginas = Math.max(1, Math.ceil(vendasOrdenadas.length / itensPorPagina));
    const vendasDaPagina = vendasOrdenadas.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina);
    const filtrosAtivos = Boolean(dataInicio || dataFim || formaPagamentoFiltro);

    const limparFiltros = () => {
        setDataInicio("");
        setDataFim("");
        setFormaPagamentoFiltro("");
        setPagina(1);
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

            <main className="sales-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                <header className="sales-header">
                    <div className="sales-heading">
                        <span className="sales-eyebrow">Operação da loja</span>
                        <h1>Vendas</h1>
                        <p>Consulte e acompanhe as vendas realizadas.</p>
                    </div>

                    <div className="sales-header-actions">
                        <span className="sales-count-pill">
                            {vendasFiltradas.length} {vendasFiltradas.length === 1 ? "venda" : "vendas"}
                        </span>
                        <Link to="/vendas/cadastrar" className="sales-primary-action">
                            <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
                            <span>Nova venda</span>
                        </Link>
                    </div>
                </header>

                <section className="sales-filter-panel" aria-label="Filtros de vendas">
                    <div className="sales-filter-heading">
                        <SlidersHorizontal size={17} aria-hidden="true" />
                        <span>Filtrar resultados</span>
                    </div>

                    <div className="sales-filter-controls">
                        <fieldset className="sales-date-group">
                            <legend>Período de venda</legend>
                            <label className="sales-field">
                                <span>Data inicial</span>
                                <span className="sales-date-input">
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        onChange={(event) => { setDataInicio(event.target.value); setPagina(1); }}
                                        aria-label="Data inicial do filtro"
                                    />
                                </span>
                            </label>
                            <label className="sales-field">
                                <span>Data final</span>
                                <span className="sales-date-input">
                                    <input
                                        type="date"
                                        value={dataFim}
                                        onChange={(event) => { setDataFim(event.target.value); setPagina(1); }}
                                        aria-label="Data final do filtro"
                                    />
                                </span>
                            </label>
                        </fieldset>

                        <label className="sales-field sales-payment-field">
                            <span>Forma de pagamento</span>
                            <select
                                value={formaPagamentoFiltro}
                                onChange={(event) => { setFormaPagamentoFiltro(event.target.value); setPagina(1); }}
                                aria-label="Filtrar vendas por forma de pagamento"
                            >
                                <option value="">Todas as formas</option>
                                {opcoesFormaPagamento.map((forma) => <option key={forma} value={forma}>{forma}</option>)}
                            </select>
                        </label>

                        {filtrosAtivos && (
                            <button type="button" className="sales-clear-filters" onClick={limparFiltros}>
                                <RotateCcw size={15} aria-hidden="true" />
                                Limpar filtros
                            </button>
                        )}
                    </div>
                </section>

                <section className="sales-metrics" aria-label="Resumo do período">
                    <article className="sales-metric sales-metric--revenue">
                        <span className="sales-metric__label">Faturamento do período</span>
                        <strong>{formatarMoeda(faturamentoPeriodo)}</strong>
                        <span className="sales-metric__detail">Soma das vendas filtradas</span>
                    </article>
                    <article className="sales-metric">
                        <span className="sales-metric__label">Vendas</span>
                        <strong>{vendasFiltradas.length}</strong>
                        <span className="sales-metric__detail">{formaPagamentoMaisUsada === "Sem dados" ? "Nenhuma forma registrada" : `Mais usada: ${formaPagamentoMaisUsada}`}</span>
                    </article>
                    <article className="sales-metric">
                        <span className="sales-metric__label">Ticket médio</span>
                        <strong>{formatarMoeda(ticketMedio)}</strong>
                        <span className="sales-metric__detail">Faturamento dividido por vendas</span>
                    </article>
                </section>

                <section className="sales-results" aria-label="Resultados de vendas">
                    <div className="sales-results-toolbar">
                        <div>
                            <h2>Vendas registradas</h2>
                            <span>{vendasOrdenadas.length} {vendasOrdenadas.length === 1 ? "resultado" : "resultados"}</span>
                        </div>
                        <div className="sales-results-controls">
                            <label className="sales-sort-control">
                                <span>Ordenar por</span>
                                <select value={ordenacao} onChange={(event) => { setOrdenacao(event.target.value); setPagina(1); }}>
                                    <option value="recentes">Mais recentes</option>
                                    <option value="antigas">Mais antigas</option>
                                    <option value="maiorValor">Maior valor</option>
                                    <option value="menorValor">Menor valor</option>
                                </select>
                            </label>
                            <div className="sales-view-toggle" role="group" aria-label="Modo de visualização">
                                <button type="button" className={visualizacao === "cards" ? "is-active" : ""} aria-pressed={visualizacao === "cards"} aria-label="Visualizar em cartões" onClick={() => setVisualizacao("cards")}>
                                    <LayoutGrid size={17} aria-hidden="true" />
                                </button>
                                <button type="button" className={visualizacao === "tabela" ? "is-active" : ""} aria-pressed={visualizacao === "tabela"} aria-label="Visualizar em tabela" onClick={() => setVisualizacao("tabela")}>
                                    <List size={18} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {vendasOrdenadas.length === 0 ? (
                        <div className="sales-empty-state">
                            <div className="sales-empty-icon"><TrendingUp size={28} aria-hidden="true" /></div>
                            <h3>{filtrosAtivos ? "Nenhuma venda neste período" : "Ainda não há vendas registradas"}</h3>
                            <p>{filtrosAtivos ? "Altere os filtros para encontrar vendas ou limpe os critérios aplicados." : "Quando registrar uma venda, ela aparecerá aqui para consulta."}</p>
                            <div className="sales-empty-actions">
                                {!vendasFiltradas.length && !filtrosAtivos && <Link to="/vendas/cadastrar" className="sales-primary-action"><Plus size={18} aria-hidden="true" />Registrar primeira venda</Link>}
                            </div>
                        </div>
                    ) : visualizacao === "cards" ? (
                        <VendasList vendas={vendasDaPagina} />
                    ) : (
                        <div className="sales-table-wrap">
                            <table className="sales-table">
                                <thead>
                                    <tr><th>Venda</th><th>Vendedor</th><th>Data</th><th>Pagamento</th><th>Produtos</th><th>Total</th><th>Status</th><th><span className="visually-hidden">Ações</span></th></tr>
                                </thead>
                                <tbody>
                                    {vendasDaPagina.map((venda) => (
                                        <tr key={venda.Id ?? venda.id}>
                                            <td className="sales-table__id">#{venda.Id ?? venda.id}</td>
                                            <td>{venda.NomeVendedor}</td>
                                            <td>{formatarDataExibicao(venda.DataCad ?? venda.dataCad ?? venda.Data ?? venda.data)}</td>
                                            <td>{venda.formaPagamento ?? venda.FormaPagamento ?? venda.forma_pagamento ?? "Não informado"}</td>
                                            <td>{formatarQuantidadeItens(venda.QuantidadeItens ?? venda.quantidadeItens)}</td>
                                            <td className="sales-table__amount">{formatarMoeda(venda.ValorTotal ?? venda.valorTotal)}</td>
                                            <td><span className="sales-status-badge">Registrada</span></td>
                                            <td><Link className="sales-detail-icon" to={`/vendas/${venda.Id ?? venda.id}`} aria-label={`Ver detalhes da venda ${venda.Id ?? venda.id}`}><Eye size={17} aria-hidden="true" /></Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {vendasOrdenadas.length > 0 && (
                        <nav className="sales-pagination" aria-label="Paginação de vendas">
                            <span>Mostrando {Math.min((pagina - 1) * itensPorPagina + 1, vendasOrdenadas.length)}–{Math.min(pagina * itensPorPagina, vendasOrdenadas.length)} de {vendasOrdenadas.length}</span>
                            <div>
                                <button type="button" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina((atual) => Math.max(1, atual - 1))}><ArrowLeft size={16} aria-hidden="true" /></button>
                                <span>Página {pagina} de {totalPaginas}</span>
                                <button type="button" aria-label="Próxima página" disabled={pagina >= totalPaginas} onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}><ArrowRight size={16} aria-hidden="true" /></button>
                            </div>
                        </nav>
                    )}
                </section>
            </main>
        </div>
    );
}

function parseDataVenda(data) {
    if (!data) return null;
    const dateOnly = String(data).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const parsed = dateOnly
        ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
        : new Date(data);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataExibicao(data) {
    const parsed = parseDataVenda(data);
    return parsed ? parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function formatarQuantidadeItens(quantidade) {
    const numero = Number(quantidade);
    if (!Number.isFinite(numero)) return "—";
    return `${numero} ${numero === 1 ? "produto" : "produtos"}`;
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