import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useFornecedores } from "../hooks/useFornecedores";
import { deletarFornecedor } from "../services/fornecedoresService";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Fornecedor() {
    const { fornecedores, loading, error } = useFornecedores();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const navigate = useNavigate();

    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
    const [excluindo, setExcluindo] = useState(false);

    useEffect(() => {
        setListaFornecedores(fornecedores);
    }, [fornecedores]);

    const handleExcluir = (fornecedor) => {
        setFornecedorSelecionado(fornecedor);
    };
    const confirmarExclusao = async () => {
        if (!fornecedorSelecionado) {
            return;
        }

        try {
            setExcluindo(true);

            await deletarFornecedor(fornecedorSelecionado.Id);

            setListaFornecedores((listaAtual) =>
                listaAtual.filter(
                    (item) => item.Id !== fornecedorSelecionado.Id
                )
            );

            setFornecedorSelecionado(null);

        } catch (error) {
            console.error("Erro ao excluir fornecedor:", error);

            alert(
                error.response?.data?.message ||
                "Não foi possível excluir o fornecedor."
            );
        } finally {
            setExcluindo(false);
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
                            style={{ ...styles.cadastrarButton, ...(isDark ? styles.cadastrarButtonDark : {}) }}
                            onClick={() =>
                                navigate("/fornecedores/cadastrar")
                            }
                        >
                            <span className="material-symbols-outlined">
                                add
                            </span>

                        </button>

                        <div style={{ ...styles.total, ...(isDark ? styles.totalDark : {}) }}>

                            <span className="material-symbols-outlined">
                                groups
                            </span>

                            <span>
                                {listaFornecedores.length} fornecedor
                                {listaFornecedores.length !== 1
                                    ? "es"
                                    : ""}
                            </span>

                        </div>

                    </div>

                </header>

                {/* FORNECEDORES */}

                {listaFornecedores.length === 0 ? (

                    <section style={{ ...styles.emptyCard, ...(isDark ? styles.emptyCardDark : {}) }}>

                        <span className="material-symbols-outlined">
                            person_search
                        </span>

                        <h3 style={{ ...styles.emptyTitle, ...(isDark ? styles.emptyTitleDark : {}) }}>
                            Nenhum fornecedor encontrado
                        </h3>

                        <p style={{ ...styles.emptyText, ...(isDark ? styles.emptyTextDark : {}) }}>
                            Ainda não existem fornecedores cadastrados.
                        </p>

                    </section>

                ) : (

                    <section style={styles.gridContainer}>

                        {listaFornecedores.map((fornecedor) => (

                            <FornecedorCard
                                key={fornecedor.Id}
                                fornecedor={fornecedor}
                                onExcluir={handleExcluir}
                                excluindo={excluindo}
                                dark={isDark}
                            />

                        ))}

                    </section>

                )}

                {fornecedorSelecionado && (

                    <div style={styles.overlay}>

                        <div style={{ ...styles.confirmCard, ...(isDark ? styles.confirmCardDark : {}) }}>

                            <div style={{ ...styles.confirmIcon, ...(isDark ? styles.confirmIconDark : {}) }}>
                                <span className="material-symbols-outlined">
                                    delete
                                </span>
                            </div>

                            <div style={styles.confirmContent}>

                                <strong style={{ ...styles.confirmTitle, ...(isDark ? styles.confirmTitleDark : {}) }}>
                                    Excluir fornecedor?
                                </strong>

                                <span style={{ ...styles.confirmText, ...(isDark ? styles.confirmTextDark : {}) }}>
                                    {fornecedorSelecionado.Nome}
                                </span>

                            </div>

                            <div style={styles.confirmActions}>

                                <button
                                    type="button"
                                    style={{ ...styles.cancelConfirmButton, ...(isDark ? styles.cancelConfirmButtonDark : {}) }}
                                    onClick={() =>
                                        setFornecedorSelecionado(null)
                                    }
                                    disabled={excluindo}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    style={styles.confirmDeleteButton}
                                    onClick={confirmarExclusao}
                                    disabled={excluindo}
                                >
                                    <span className="material-symbols-outlined">
                                        {excluindo
                                            ? "progress_activity"
                                            : "delete"}
                                    </span>

                                    {excluindo
                                        ? "Excluindo..."
                                        : "Excluir"}
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>
        </div>
    );
}

function FornecedorCard({ fornecedor, onExcluir, excluindo, dark }) {
    const imagem = fornecedor.Imagem
        ? `http://localhost:8000${fornecedor.Imagem}`
        : null;

    return (
        <article style={{ ...styles.card, ...(dark ? styles.cardDark : {}) }}>
            <div style={styles.cardImageContainer}>
                {imagem ? (
                    <img
                        src={imagem}
                        alt={fornecedor.Nome}
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
                        <h3 style={{ ...styles.cardName, ...(dark ? styles.cardNameDark : {}) }}>{fornecedor.Nome}</h3>
                        <span style={{ ...styles.cardMeta, ...(dark ? styles.cardMetaDark : {}) }}>
                            Fornecedor cadastrado
                        </span>
                    </div>
                </div>
            </div>

            <div style={styles.cardActions}>
                <button
                    type="button"
                    style={{ ...styles.deleteButton, ...(dark ? styles.deleteButtonDark : {}) }}
                    onClick={() => onExcluir(fornecedor)}
                    disabled={excluindo}
                >
                    <span className="material-symbols-outlined">delete</span>
                    Excluir
                </button>
            </div>
        </article>
    );
}

const styles = {
    layout: { display: "flex", minHeight: "100vh", backgroundColor: "#f3f5f9" },
    layoutDark: { backgroundColor: "#0f172a" },
    page: { marginLeft: "256px", width: "calc(100% - 256px)", padding: "32px 32px 40px", boxSizing: "border-box", fontFamily: "Inter, sans-serif" },
    pageDark: { backgroundColor: "#111827", color: "#f3f4f6" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
    title: { fontFamily: "Montserrat, sans-serif", fontSize: "32px", fontWeight: "700", margin: 0, color: "#111c2d" },
    titleDark: { color: "#f9fafb" },
    subtitle: { color: "#44474c", marginTop: "5px", marginBottom: 0 },
    subtitleDark: { color: "#d1d5db" },
    headerActions: { display: "flex", alignItems: "center", gap: "12px" },
    cadastrarButton: { display: "flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#f9f9ff", color: "#303e51", cursor: "pointer" },
    cadastrarButtonDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
    total: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", color: "#243447", fontWeight: "600" },
    totalDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
    loadingBox: { minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#f9f9ff", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#44474c", fontWeight: "600" },
    loadingBoxDark: { backgroundColor: "#1f2937", borderColor: "#374151", color: "#f9fafb" },
    errorBox: { minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", color: "#9f1239", fontWeight: "600" },
    errorBoxDark: { backgroundColor: "#3f1721", borderColor: "#7f1d1d", color: "#fecdd3" },
    emptyCard: { backgroundColor: "#f9f9ff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "50px 24px", textAlign: "center", color: "#64748b" },
    emptyCardDark: { backgroundColor: "#1f2937", borderColor: "#374151", color: "#d1d5db" },
    emptyTitle: { margin: "12px 0 8px", fontSize: "20px", color: "#111c2d" },
    emptyTitleDark: { color: "#f9fafb" },
    emptyText: { margin: 0, color: "#64748b" },
    emptyTextDark: { color: "#d1d5db" },
    gridContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" },
    card: { backgroundColor: "#f9f9ff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
    cardDark: { backgroundColor: "#1f2937", borderColor: "#374151" },
    cardImageContainer: { width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", backgroundColor: "#eef2f7", marginBottom: "16px" },
    imagem: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    noImage: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e2e8f0", color: "#475569" },
    noImageDark: { backgroundColor: "#334155", color: "#e2e8f0" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
    cardInfo: { display: "flex", alignItems: "center", gap: "12px" },
    cardName: { margin: 0, color: "#111c2d", fontSize: "18px" },
    cardNameDark: { color: "#f9fafb" },
    cardMeta: { color: "#64748b", fontSize: "12px" },
    cardMetaDark: { color: "#d1d5db" },
    cardActions: { display: "flex", justifyContent: "flex-end" },
    deleteButton: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid #fecaca", backgroundColor: "#fff1f2", color: "#b91c1c", padding: "10px 12px", borderRadius: "8px", cursor: "pointer" },
    deleteButtonDark: { backgroundColor: "#3f1721", borderColor: "#7f1d1d", color: "#fecdd3" },
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
    confirmCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "22px", width: "100%", maxWidth: "420px", border: "1px solid #e2e8f0" },
    confirmCardDark: { backgroundColor: "#111827", borderColor: "#374151" },
    confirmIcon: { width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff1f2", color: "#b91c1c", marginBottom: "12px" },
    confirmIconDark: { backgroundColor: "#3f1721", color: "#fecdd3" },
    confirmContent: { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "18px" },
    confirmTitle: { color: "#111c2d", fontSize: "18px" },
    confirmTitleDark: { color: "#f9fafb" },
    confirmText: { color: "#475569" },
    confirmTextDark: { color: "#d1d5db" },
    confirmActions: { display: "flex", justifyContent: "flex-end", gap: "12px" },
    cancelConfirmButton: { border: "1px solid #d1d5db", backgroundColor: "#ffffff", color: "#374151", borderRadius: "8px", padding: "10px 12px", cursor: "pointer" },
    cancelConfirmButtonDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
    confirmDeleteButton: { display: "flex", alignItems: "center", gap: "8px", border: "none", backgroundColor: "#dc2626", color: "#ffffff", borderRadius: "8px", padding: "10px 12px", cursor: "pointer" },
};