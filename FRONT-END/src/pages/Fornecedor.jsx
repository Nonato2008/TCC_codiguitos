import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useFornecedores } from "../hooks/useFornecedores";
import { useProdutos } from "../hooks/useProdutos";
import { ThemeContext } from "../contexts/ThemeContext";

const CHAVE_FORNECEDORES_DESATIVADOS = "fornecedoresDesativados";

function getIdFornecedor(fornecedor) {
    return fornecedor?.Id ?? fornecedor?.id ?? fornecedor?.idFornecedor ?? fornecedor?.IdFornecedor;
}

function getIdFornecedorProduto(produto) {
    return produto?.IdFornecedor ?? produto?.idFornecedor ?? produto?.id_fornecedor;
}

function getIdProduto(produto) {
    return produto?.Id ?? produto?.id ?? produto?.IdProduto ?? produto?.idProduto;
}

function lerFornecedoresDesativados() {
    try {
        const ids = JSON.parse(
            localStorage.getItem(CHAVE_FORNECEDORES_DESATIVADOS) || "[]"
        );

        return Array.isArray(ids)
            ? ids.map(String)
            : [];
    } catch (error) {
        console.error("Erro ao carregar fornecedores desativados:", error);
        return [];
    }
}

export default function Fornecedor() {
    const { fornecedores, loading, error } = useFornecedores();
    const {
        produtos,
        loading: carregandoProdutos,
        error: erroProdutos
    } = useProdutos();

    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const navigate = useNavigate();

    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
    const [abaFornecedores, setAbaFornecedores] = useState("ativos");

    useEffect(() => {
        setListaFornecedores(fornecedores);
    }, [fornecedores]);

    const fornecedoresFiltrados = listaFornecedores.filter((fornecedor) =>
        abaFornecedores === "ativos" ? fornecedor.ativo : !fornecedor.ativo
    );

    const idFornecedorSelecionado = getIdFornecedor(fornecedorSelecionado);
    const produtosFornecedor = fornecedorSelecionado &&
        idFornecedorSelecionado !== undefined &&
        idFornecedorSelecionado !== null
        ? (Array.isArray(produtos) ? produtos : []).filter(
            (produto) => {
                const idFornecedorProduto = getIdFornecedorProduto(produto);
                return idFornecedorProduto !== undefined &&
                    idFornecedorProduto !== null &&
                    String(idFornecedorProduto) === String(idFornecedorSelecionado);
            }
        )
        : [];

    function alterarStatusFornecedor(fornecedor, ativo) {
        const idFornecedor = getIdFornecedor(fornecedor);
        const idsDesativados = lerFornecedoresDesativados();
        const idsAtualizados = ativo
            ? idsDesativados.filter((id) => id !== String(idFornecedor))
            : [...new Set([...idsDesativados, String(idFornecedor)])];

        try {
            localStorage.setItem(
                CHAVE_FORNECEDORES_DESATIVADOS,
                JSON.stringify(idsAtualizados)
            );
            setListaFornecedores((listaAtual) =>
                listaAtual.map((item) =>
                    String(getIdFornecedor(item)) === String(idFornecedor)
                        ? { ...item, ativo }
                        : item
                )
            );
        } catch (error) {
            console.error("Erro ao alterar status do fornecedor:", error);
            alert(
                "Não foi possível atualizar o status do fornecedor neste navegador."
            );
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
                <Sidebar />

                <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
                    <header style={styles.header}>
                        <div>
                            <h2 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>
                                Fornecedores
                            </h2>

                            <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                                Gerencie os fornecedores cadastrados na loja.
                            </p>
                        </div>
                    </header>

                    <div style={{ ...styles.loadingBox, ...(isDark ? styles.loadingBoxDark : {}) }}>
                        <span className="material-symbols-outlined">
                            progress_activity
                        </span>

                        Carregando fornecedores...
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
                            <h2 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>
                                Fornecedores
                            </h2>

                            <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                                Gerencie os fornecedores cadastrados na loja.
                            </p>
                        </div>
                    </header>

                    <div style={{ ...styles.errorBox, ...(isDark ? styles.errorBoxDark : {}) }}>
                        <span className="material-symbols-outlined">
                            error
                        </span>

                        <span>{error}</span>
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
                        <h2 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>
                            Fornecedores
                        </h2>

                        <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                            Gerencie os fornecedores cadastrados na loja.
                        </p>
                    </div>

                    <div style={styles.headerActions}>
                        <button
                            type="button"
                            style={{
                                ...styles.cadastrarButton,
                                ...(isDark ? styles.cadastrarButtonDark : {})
                            }}
                            onClick={() => navigate("/fornecedores/cadastrar")}
                        >
                            <span className="material-symbols-outlined">
                                add
                            </span>
                        </button>

                        <div
                            style={{
                                ...styles.total,
                                ...(isDark ? styles.totalDark : {})
                            }}
                        >
                            <span className="material-symbols-outlined">
                                groups
                            </span>

                            <span>
                                {fornecedoresFiltrados.length} fornecedor
                                {fornecedoresFiltrados.length !== 1 ? "es" : ""}
                            </span>
                        </div>
                    </div>
                </header>

                <div style={styles.tabs}>
                    <button
                        type="button"
                        onClick={() => setAbaFornecedores("ativos")}
                        aria-pressed={abaFornecedores === "ativos"}
                        style={{
                            ...styles.tabButton,
                            ...(isDark ? styles.tabButtonDark : {}),
                            ...(abaFornecedores === "ativos"
                                ? styles.tabButtonActive
                                : {}),
                            ...(isDark && abaFornecedores === "ativos"
                                ? styles.tabButtonActiveDark
                                : {})
                        }}
                    >
                        Ativos ({listaFornecedores.filter((item) => item.ativo).length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setAbaFornecedores("desativados")}
                        aria-pressed={abaFornecedores === "desativados"}
                        style={{
                            ...styles.tabButton,
                            ...(isDark ? styles.tabButtonDark : {}),
                            ...(abaFornecedores === "desativados"
                                ? styles.tabButtonActive
                                : {}),
                            ...(isDark && abaFornecedores === "desativados"
                                ? styles.tabButtonActiveDark
                                : {})
                        }}
                    >
                        Desativados ({listaFornecedores.filter((item) => !item.ativo).length})
                    </button>
                </div>

                {fornecedoresFiltrados.length === 0 ? (
                    <section style={{ ...styles.emptyCard, ...(isDark ? styles.emptyCardDark : {}) }}>
                        <span className="material-symbols-outlined">
                            person_search
                        </span>

                        <h3 style={{ ...styles.emptyTitle, ...(isDark ? styles.emptyTitleDark : {}) }}>
                            {abaFornecedores === "ativos"
                                ? "Nenhum fornecedor ativo"
                                : "Nenhum fornecedor desativado"}
                        </h3>

                        <p style={{ ...styles.emptyText, ...(isDark ? styles.emptyTextDark : {}) }}>
                            {abaFornecedores === "ativos"
                                ? "Não há fornecedores ativos para exibir."
                                : "Os fornecedores desativados aparecerão aqui."}
                        </p>
                    </section>
                ) : (
                    <section style={styles.gridContainer}>
                        {fornecedoresFiltrados.map((fornecedor) => (
                            <FornecedorCard
                                key={getIdFornecedor(fornecedor)}
                                fornecedor={fornecedor}
                                onSelecionar={setFornecedorSelecionado}
                                onAlterarStatus={alterarStatusFornecedor}
                                dark={isDark}
                            />
                        ))}
                    </section>
                )}

                {fornecedorSelecionado && (
                    <div
                        style={styles.overlay}
                        onClick={() => setFornecedorSelecionado(null)}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="fornecedor-produtos-titulo"
                            style={{
                                ...styles.detailsCard,
                                ...(isDark ? styles.detailsCardDark : {})
                            }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <header style={styles.detailsHeader}>
                                <div>
                                    <h2
                                        id="fornecedor-produtos-titulo"
                                        style={{
                                            ...styles.detailsTitle,
                                            ...(isDark ? styles.detailsTitleDark : {})
                                        }}
                                    >
                                        Produtos de {fornecedorSelecionado.Nome ?? fornecedorSelecionado.nome ?? "Fornecedor"}
                                    </h2>
                                    <p
                                        style={{
                                            ...styles.detailsSubtitle,
                                            ...(isDark ? styles.detailsSubtitleDark : {})
                                        }}
                                    >
                                        {produtosFornecedor.length} produto
                                        {produtosFornecedor.length !== 1 ? "s" : ""} associado
                                        {produtosFornecedor.length !== 1 ? "s" : ""} a este fornecedor
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Fechar lista de produtos"
                                    style={{
                                        ...styles.closeButton,
                                        ...(isDark ? styles.closeButtonDark : {})
                                    }}
                                    onClick={() => setFornecedorSelecionado(null)}
                                >
                                    ×
                                </button>
                            </header>

                            {carregandoProdutos ? (
                                <div
                                    style={{
                                        ...styles.productsEmpty,
                                        ...(isDark ? styles.productsEmptyDark : {})
                                    }}
                                >
                                    Carregando produtos...
                                </div>
                            ) : erroProdutos ? (
                                <div
                                    style={{
                                        ...styles.productsError,
                                        ...(isDark ? styles.productsErrorDark : {})
                                    }}
                                >
                                    {erroProdutos}
                                </div>
                            ) : produtosFornecedor.length === 0 ? (
                                <div
                                    style={{
                                        ...styles.productsEmpty,
                                        ...(isDark ? styles.productsEmptyDark : {})
                                    }}
                                >
                                    Nenhum produto está associado a este fornecedor.
                                </div>
                            ) : (
                                <ul style={styles.productsList}>
                                    {produtosFornecedor.map((produto, index) => (
                                        <li
                                            key={getIdProduto(produto) ?? index}
                                            style={{
                                                ...styles.productRow,
                                                ...(isDark ? styles.productRowDark : {})
                                            }}
                                        >
                                            <div>
                                                <strong
                                                    style={{
                                                        ...styles.productName,
                                                        ...(isDark ? styles.productNameDark : {})
                                                    }}
                                                >
                                                    {produto.Nome ?? produto.nome ?? "Produto sem nome"}
                                                </strong>
                                                <span
                                                    style={{
                                                        ...styles.productMeta,
                                                        ...(isDark ? styles.productMetaDark : {})
                                                    }}
                                                >
                                                    Estoque: {produto.Quantidade ?? produto.quantidade ?? 0}
                                                </span>
                                            </div>
                                            <strong
                                                style={{
                                                    ...styles.productPrice,
                                                    ...(isDark ? styles.productPriceDark : {})
                                                }}
                                            >
                                                {Number(produto.Preco ?? produto.preco ?? 0).toLocaleString(
                                                    "pt-BR",
                                                    { style: "currency", currency: "BRL" }
                                                )}
                                            </strong>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <footer style={styles.detailsActions}>
                                <button
                                    type="button"
                                    style={{
                                        ...styles.statusButton,
                                        ...(fornecedorSelecionado.ativo
                                            ? styles.deactivateButton
                                            : styles.activateButton),
                                        ...(isDark ? styles.statusButtonDark : {})
                                    }}
                                    onClick={() => {
                                        alterarStatusFornecedor(
                                            fornecedorSelecionado,
                                            !fornecedorSelecionado.ativo
                                        );
                                        setFornecedorSelecionado(null);
                                    }}
                                >
                                    {fornecedorSelecionado.ativo
                                        ? "Desativar fornecedor"
                                        : "Reativar fornecedor"}
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        ...styles.cancelConfirmButton,
                                        ...(isDark ? styles.cancelConfirmButtonDark : {})
                                    }}
                                    onClick={() => setFornecedorSelecionado(null)}
                                >
                                    Fechar
                                </button>
                            </footer>
                        </section>
                    </div>
                )}

            </main>
        </div>
    );
}

function FornecedorCard({ fornecedor, onSelecionar, onAlterarStatus, dark }) {
    const nome = fornecedor.Nome ?? fornecedor.nome ?? "Fornecedor";
    const caminhoImagem = fornecedor.Imagem ?? fornecedor.imagem;
    const imagem = caminhoImagem
        ? `http://localhost:8000${caminhoImagem}`
        : null;

    return (
        <article style={{ ...styles.card, ...(dark ? styles.cardDark : {}) }}>
            <div style={styles.cardImageContainer}>
                {imagem ? (
                    <img
                        src={imagem}
                        alt={nome}
                        style={styles.imagem}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div style={{ ...styles.noImage, ...(dark ? styles.noImageDark : {}) }}>
                        <span className="material-symbols-outlined">
                            business
                        </span>
                    </div>
                )}
            </div>

            <div style={styles.cardHeader}>
                <div style={styles.cardInfo}>
                    <div>
                        <h3 style={{ ...styles.cardName, ...(dark ? styles.cardNameDark : {}) }}>
                            {nome}
                        </h3>

                        <span style={{ ...styles.cardMeta, ...(dark ? styles.cardMetaDark : {}) }}>
                            {fornecedor.ativo ? "Fornecedor ativo" : "Fornecedor desativado"}
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.cardActions}>
                <button
                    type="button"
                    style={{ ...styles.detailsButton, ...(dark ? styles.detailsButtonDark : {}) }}
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelecionar(fornecedor);
                    }}
                >
                    <span className="material-symbols-outlined">
                        inventory_2
                    </span>

                    Ver produtos
                </button>
                <button
                    type="button"
                    style={{
                        ...styles.statusButton,
                        ...(fornecedor.ativo
                            ? styles.deactivateButton
                            : styles.activateButton),
                        ...(dark ? styles.statusButtonDark : {})
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        onAlterarStatus(fornecedor, !fornecedor.ativo);
                    }}
                >
                    {fornecedor.ativo ? "Desativar" : "Reativar"}
                </button>
            </div>
        </article>
    );
}

const styles = {
    layout: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--surface)"
    },

    layoutDark: {
        backgroundColor: "var(--app-background)"
    },

    page: {
        marginLeft: "256px",
        width: "calc(100% - 256px)",
        padding: "32px 32px 40px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif"
    },

    pageDark: {
        backgroundColor: "var(--surface)",
        color: "#f3f4f6"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "32px"
    },

    title: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "32px",
        fontWeight: "700",
        margin: 0,
        color: "#111c2d"
    },

    titleDark: {
        color: "#f9fafb"
    },

    subtitle: {
        color: "#44474c",
        marginTop: "5px",
        marginBottom: 0
    },

    subtitleDark: {
        color: "#d1d5db"
    },

    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    cadastrarButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--surface)",
        color: "#303e51",
        cursor: "pointer"
    },

    cadastrarButtonDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
        color: "#f9fafb"
    },

    total: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "10px 14px",
        color: "#243447",
        fontWeight: "600"
    },

    totalDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
        color: "#f9fafb"
    },

    loadingBox: {
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        color: "#44474c",
        fontWeight: "600"
    },

    loadingBoxDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
        color: "#f9fafb"
    },

    errorBox: {
        minHeight: "160px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        borderRadius: "10px",
        color: "#9f1239",
        fontWeight: "600"
    },

    errorBoxDark: {
        backgroundColor: "#3f1721",
        borderColor: "#7f1d1d",
        color: "#fecdd3"
    },

    emptyCard: {
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "50px 24px",
        textAlign: "center",
        color: "#64748b"
    },

    emptyCardDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
        color: "#d1d5db"
    },

    emptyTitle: {
        margin: "12px 0 8px",
        fontSize: "20px",
        color: "#111c2d"
    },

    emptyTitleDark: {
        color: "#f9fafb"
    },

    emptyText: {
        margin: 0,
        color: "#64748b"
    },

    emptyTextDark: {
        color: "#d1d5db"
    },

    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "18px"
    },

    card: {
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
    },

    cardDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)"
    },

    cardImageContainer: {
        width: "100%",
        height: "180px",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "var(--surface-muted)",
        marginBottom: "16px"
    },

    imagem: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
        display: "block"
    },

    noImage: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e2e8f0",
        color: "#475569"
    },

    noImageDark: {
        backgroundColor: "#334155",
        color: "#e2e8f0"
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px"
    },

    cardInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    cardName: {
        margin: 0,
        color: "#111c2d",
        fontSize: "18px"
    },

    cardNameDark: {
        color: "#f9fafb"
    },

    cardMeta: {
        color: "#64748b",
        fontSize: "12px"
    },

    cardMetaDark: {
        color: "#d1d5db"
    },

    cardActions: {
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "8px"
    },

    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000
    },

    tabs: {
        display: "flex",
        gap: "8px",
        marginBottom: "20px",
        borderBottom: "1px solid var(--border-color)"
    },

    tabButton: {
        border: "none",
        borderBottom: "2px solid transparent",
        backgroundColor: "transparent",
        color: "#64748b",
        padding: "10px 12px",
        fontWeight: 600,
        cursor: "pointer"
    },

    tabButtonDark: {
        color: "#ffffff"
    },

    tabButtonActive: {
        color: "var(--accent-color)",
        borderBottomColor: "var(--accent-color)"
    },

    tabButtonActiveDark: {
        color: "#ffffff",
        borderBottomColor: "#ffffff"
    },

    detailsButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--surface)",
        color: "#334155",
        padding: "10px 12px",
        borderRadius: "8px",
        cursor: "pointer"
    },

    detailsButtonDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
        color: "#f9fafb"
    },

    statusButton: {
        border: "1px solid",
        borderRadius: "8px",
        padding: "10px 12px",
        cursor: "pointer",
        fontWeight: 600
    },

    statusButtonDark: {
        filter: "brightness(0.9)"
    },

    deactivateButton: {
        borderColor: "#fca5a5",
        backgroundColor: "#fff1f2",
        color: "#b91c1c"
    },

    activateButton: {
        borderColor: "#86efac",
        backgroundColor: "#f0fdf4",
        color: "#166534"
    },

    detailsCard: {
        backgroundColor: "var(--surface)",
        borderRadius: "12px",
        padding: "22px",
        width: "100%",
        maxWidth: "680px",
        maxHeight: "90vh",
        overflowY: "auto",
        border: "1px solid var(--border-color)",
        boxSizing: "border-box"
    },

    detailsCardDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)"
    },

    detailsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "18px"
    },

    detailsTitle: {
        margin: 0,
        color: "#111c2d",
        fontSize: "20px"
    },

    detailsTitleDark: {
        color: "#f9fafb"
    },

    detailsSubtitle: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "14px"
    },

    detailsSubtitleDark: {
        color: "#cbd5e1"
    },

    closeButton: {
        border: "none",
        backgroundColor: "transparent",
        color: "#475569",
        fontSize: "28px",
        lineHeight: 1,
        cursor: "pointer"
    },

    closeButtonDark: {
        color: "#e5e7eb"
    },

    productsList: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        listStyle: "none",
        padding: 0,
        margin: "0 0 20px"
    },

    productRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        padding: "12px",
        border: "1px solid var(--border-color)",
        borderRadius: "8px"
    },

    productRowDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)"
    },

    productName: {
        display: "block",
        color: "#111c2d",
        fontSize: "14px"
    },

    productNameDark: {
        color: "#f9fafb"
    },

    productMeta: {
        display: "block",
        marginTop: "4px",
        color: "#64748b",
        fontSize: "13px"
    },

    productMetaDark: {
        color: "#cbd5e1"
    },

    productPrice: {
        color: "#166534",
        fontSize: "14px",
        whiteSpace: "nowrap"
    },

    productPriceDark: {
        color: "#86efac"
    },

    productsEmpty: {
        padding: "24px",
        marginBottom: "20px",
        border: "1px dashed var(--border-color)",
        borderRadius: "8px",
        color: "#64748b",
        textAlign: "center"
    },

    productsEmptyDark: {
        borderColor: "var(--border-color)",
        color: "#cbd5e1"
    },

    productsError: {
        padding: "16px",
        marginBottom: "20px",
        borderRadius: "8px",
        backgroundColor: "#fff1f2",
        color: "#b91c1c"
    },

    productsErrorDark: {
        backgroundColor: "#3f1721",
        color: "#fecdd3"
    },

    detailsActions: {
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "10px",
        paddingTop: "16px",
        borderTop: "1px solid var(--border-color)"
    },

    cancelConfirmButton: {
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--surface)",
        color: "#374151",
        borderRadius: "8px",
        padding: "10px 12px",
        cursor: "pointer"
    },

    cancelConfirmButtonDark: {
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-color)",
        color: "#f9fafb"
    }

};