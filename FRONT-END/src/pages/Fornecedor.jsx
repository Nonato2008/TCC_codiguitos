import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useFornecedores } from "../hooks/useFornecedores";
import { deletarFornecedor } from "../services/fornecedoresService";

export default function Fornecedor() {
    const { fornecedores, loading, error } = useFornecedores();

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
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>

                    <header style={styles.header}>
                        <div>
                            <h2 style={styles.title}>
                                Fornecedores
                            </h2>

                            <p style={styles.subtitle}>
                                Gerencie os fornecedores cadastrados na loja.
                            </p>
                        </div>
                    </header>

                    <div style={styles.loadingBox}>
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
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>

                    <header style={styles.header}>
                        <div>
                            <h2 style={styles.title}>
                                Fornecedores
                            </h2>

                            <p style={styles.subtitle}>
                                Gerencie os fornecedores cadastrados na loja.
                            </p>
                        </div>
                    </header>

                    <div style={styles.errorBox}>
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
        <div style={styles.layout}>

            <Sidebar />

            <main style={styles.page}>

                <header style={styles.header}>

                    <div>
                        <h2 style={styles.title}>
                            Fornecedores
                        </h2>

                        <p style={styles.subtitle}>
                            Gerencie os fornecedores cadastrados na loja.
                        </p>
                    </div>

                    <div style={styles.headerActions}>

                        <button
                            type="button"
                            style={styles.cadastrarButton}
                            onClick={() =>
                                navigate("/fornecedores/cadastrar")
                            }
                        >
                            <span className="material-symbols-outlined">
                                add
                            </span>

                        </button>

                        <div style={styles.total}>

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

                    <section style={styles.emptyCard}>

                        <span className="material-symbols-outlined">
                            person_search
                        </span>

                        <h3 style={styles.emptyTitle}>
                            Nenhum fornecedor encontrado
                        </h3>

                        <p style={styles.emptyText}>
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
                            />

                        ))}

                    </section>

                )}

                {fornecedorSelecionado && (

                    <div style={styles.overlay}>

                        <div style={styles.confirmCard}>

                            <div style={styles.confirmIcon}>
                                <span className="material-symbols-outlined">
                                    delete
                                </span>
                            </div>

                            <div style={styles.confirmContent}>

                                <strong style={styles.confirmTitle}>
                                    Excluir fornecedor?
                                </strong>

                                <span style={styles.confirmText}>
                                    {fornecedorSelecionado.Nome}
                                </span>

                            </div>

                            <div style={styles.confirmActions}>

                                <button
                                    type="button"
                                    style={styles.cancelConfirmButton}
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

function FornecedorCard({
    fornecedor,
    onExcluir,
    excluindo
}) {

    const imagem = fornecedor.Imagem
        ? `http://localhost:8000${fornecedor.Imagem}`
        : null;

    return (
        <div style={styles.card}>

            <div style={styles.cardImageContainer}>

                {imagem ? (

                    <img
                        src={imagem}
                        alt={fornecedor.Nome}
                        style={styles.imagem}
                    />

                ) : (

                    <div style={styles.noImage}>

                        <span className="material-symbols-outlined">
                            business
                        </span>

                    </div>

                )}

            </div>

            <div style={styles.cardContent}>

                <div style={styles.cardTop}>

                    <span style={styles.label}>
                        FORNECEDOR
                    </span>

                    <span style={styles.id}>
                        #{fornecedor.Id}
                    </span>

                </div>

                <div style={styles.nomeContainer}>

                    <h3 style={styles.nome}>
                        {fornecedor.Nome}
                    </h3>

                    <button
                        type="button"
                        style={{
                            ...styles.deleteButton,
                            ...(excluindo
                                ? styles.disabledButton
                                : {})
                        }}
                        onClick={() => onExcluir(fornecedor)}
                        disabled={excluindo}
                        title="Excluir fornecedor"
                    >

                        <span className="material-symbols-outlined">
                            delete
                        </span>

                    </button>

                </div>

                <div style={styles.cardFooter}>

                    <div style={styles.footerInfo}>

                        <span className="material-symbols-outlined">
                            local_shipping
                        </span>

                        <span>
                            Fornecedor cadastrado
                        </span>

                    </div>

                </div>

            </div>

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
        marginLeft: "256px",
        width: "calc(100% - 256px)",
        padding: "32px 32px 40px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "40px",
    },

    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    title: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "32px",
        fontWeight: "700",
        margin: 0,
        color: "#111c2d",
    },

    subtitle: {
        color: "#44474c",
        marginTop: "5px",
        marginBottom: 0,
    },
    cadastrarButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "11px 18px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#303e51",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
    },

    total: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        backgroundColor: "#f9f9ff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        color: "#44474c",
        fontSize: "14px",
        fontWeight: "600",
    },

    loadingBox: {
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        backgroundColor: "#f9f9ff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        color: "#44474c",
        fontWeight: "600",
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
        fontWeight: "600",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "24px",
    },

    card: {
        backgroundColor: "#f9f9ff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    },

    cardImageContainer: {
        width: "100%",
        height: "190px",
        backgroundColor: "#eef2f7",
    },

    imagem: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },

    noImage: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#7b8190",
        backgroundColor: "#e9edf3",
    },

    cardContent: {
        padding: "20px",
    },

    cardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
    },

    label: {
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        color: "#687083",
    },

    id: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#8a909c",
    },
    nomeContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        marginBottom: "18px",
    },

    nome: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "20px",
        fontWeight: "700",
        color: "#111c2d",
        margin: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    deleteButton: {
        width: "34px",
        height: "34px",
        minWidth: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: "1px solid #fecaca",
        borderRadius: "7px",
        backgroundColor: "#fff1f2",
        color: "#ba1a1a",
        cursor: "pointer",
    },

    disabledButton: {
        opacity: 0.6,
        cursor: "not-allowed",
    },

    cardFooter: {
        paddingTop: "14px",
        borderTop: "1px solid #e2e8f0",
    },

    footerInfo: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        color: "#75777d",
        fontSize: "13px",
    },

    emptyCard: {
        minHeight: "300px",
        backgroundColor: "#f9f9ff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#75777d",
    },

    emptyTitle: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "20px",
        color: "#111c2d",
        margin: "15px 0 5px",
    },

    emptyText: {
        margin: 0,
        color: "#75777d",
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(17, 28, 45, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },

    confirmCard: {
        width: "350px",
        maxWidth: "90%",
        backgroundColor: "#f9f9ff",
        borderRadius: "10px",
        padding: "18px",
        boxSizing: "border-box",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    confirmIcon: {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        borderRadius: "50%",
        backgroundColor: "#fff1f2",
        color: "#ba1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    confirmContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        minWidth: 0,
    },

    confirmTitle: {
        fontSize: "14px",
        fontWeight: "700",
        color: "#111c2d",
    },

    confirmText: {
        fontSize: "13px",
        color: "#686d78",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    confirmActions: {
        display: "flex",
        gap: "6px",
    },

    cancelConfirmButton: {
        padding: "7px 10px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        color: "#44474c",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },

    confirmDeleteButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "7px 10px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#ba1a1a",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },
};