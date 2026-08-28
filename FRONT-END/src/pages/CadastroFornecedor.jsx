import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { criarFornecedor } from "../services/fornecedoresService";

export default function CadastrarFornecedor() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [imagem, setImagem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!nome.trim()) {
            setError("Informe o nome do fornecedor.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("nome", nome);

            if (imagem) {
                formData.append("imagem", imagem);
            }

            await criarFornecedor(formData);

          
            setSuccess("Fornecedor cadastrado com sucesso!");

        
            setNome("");
            setImagem(null);

            // Limpa o input de arquivo
            const fileInput = document.getElementById("imagem");
            if (fileInput) {
                fileInput.value = "";
            }

        } catch (error) {
            console.error(
                "Erro ao cadastrar fornecedor:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Não foi possível cadastrar o fornecedor."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />

            <main style={styles.page}>

                {/* CABEÇALHO */}
                <header style={styles.header}>

                    <div>
                        <h2 style={styles.title}>
                            Cadastrar fornecedor
                        </h2>

                        <p style={styles.subtitle}>
                            Cadastre um novo fornecedor para a loja.
                        </p>
                    </div>

                    <button
                        type="button"
                        style={styles.voltarButton}
                        onClick={() => navigate("/fornecedores")}
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>

                        Voltar
                    </button>

                </header>


                {/* FORMULÁRIO */}
                <section style={styles.formCard}>

                    <form onSubmit={handleSubmit}>

                        {/* NOME */}
                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Nome do fornecedor
                            </label>

                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                placeholder="Digite o nome do fornecedor"
                                style={styles.input}
                            />

                        </div>


                        {/* IMAGEM */}
                        <div style={styles.formGroup}>

                            <label style={styles.label}>
                                Imagem do fornecedor
                            </label>

                            <input
                                id="imagem"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setImagem(e.target.files[0]);
                                    setError("");
                                    setSuccess("");
                                }}
                                style={styles.fileInput}
                            />

                            {imagem && (
                                <div style={styles.fileInfo}>

                                    <span className="material-symbols-outlined">
                                        image
                                    </span>

                                    <span>
                                        {imagem.name}
                                    </span>

                                </div>
                            )}

                        </div>


                        {/* MENSAGEM DE ERRO */}
                        {error && (
                            <div style={styles.errorBox}>

                                <span className="material-symbols-outlined">
                                    error
                                </span>

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}


                        {/* MENSAGEM DE SUCESSO */}
                        {success && (
                            <div style={styles.successBox}>

                                <span className="material-symbols-outlined">
                                    check_circle
                                </span>

                                <span>
                                    {success}
                                </span>

                            </div>
                        )}


                        {/* BOTÕES */}
                        <div style={styles.actions}>

                            <button
                                type="button"
                                style={styles.cancelButton}
                                onClick={() =>
                                    navigate("/fornecedores")
                                }
                                disabled={loading}
                            >
                                Cancelar
                            </button>


                            <button
                                type="submit"
                                style={{
                                    ...styles.saveButton,
                                    ...(loading
                                        ? styles.disabledButton
                                        : {})
                                }}
                                disabled={loading}
                            >

                                <span className="material-symbols-outlined">
                                    {loading
                                        ? "progress_activity"
                                        : "save"}
                                </span>

                                {loading
                                    ? "Cadastrando..."
                                    : "Cadastrar fornecedor"}

                            </button>

                        </div>

                    </form>

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

    page: {
        marginLeft: "256px",
        width: "calc(100% - 256px)",
        padding: "32px 32px 40px",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
    },


    /* CABEÇALHO */

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "40px",
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


    /* BOTÃO VOLTAR */

    voltarButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        backgroundColor: "#f9f9ff",
        color: "#303e51",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
    },


    /* FORMULÁRIO */

    formCard: {
        maxWidth: "700px",
        backgroundColor: "#f9f9ff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "30px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "24px",
    },

    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#303e51",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 14px",
        border: "1px solid #cfd5df",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#111c2d",
        fontSize: "14px",
        outline: "none",
        fontFamily: "Inter, sans-serif",
    },

    fileInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px dashed #b8c0cc",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
    },

    fileInfo: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#44474c",
        fontSize: "13px",
        padding: "10px",
        backgroundColor: "#eef2f7",
        borderRadius: "6px",
    },


    /* ERRO */

    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        marginBottom: "20px",
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        borderRadius: "8px",
        color: "#9f1239",
        fontSize: "14px",
        fontWeight: "600",
    },


    /* SUCESSO */

    successBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        marginBottom: "20px",
        backgroundColor: "#ecfdf5",
        border: "1px solid #a7f3d0",
        borderRadius: "8px",
        color: "#047857",
        fontSize: "14px",
        fontWeight: "600",
    },


    /* BOTÕES */

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        paddingTop: "10px",
        borderTop: "1px solid #e2e8f0",
    },

    cancelButton: {
        padding: "11px 18px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#44474c",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
    },

    saveButton: {
        display: "flex",
        alignItems: "center",
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

    disabledButton: {
        opacity: 0.6,
        cursor: "not-allowed",
    },
};