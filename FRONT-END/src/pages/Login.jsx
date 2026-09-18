import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
    login as apiLogin,
    saveUser
} from "../services/authService.js";
import { formatErrorMessage } from "../utils/formatErrorMessage";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Login() {

    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function entrar(event) {

        event.preventDefault();

        setError("");

        if (!nome.trim()) {
            setError("Digite seu nome.");
            return;
        }

        if (!senha) {
            setError("Digite sua senha.");
            return;
        }

        setLoading(true);

        try {

            const result = await apiLogin(
                nome.trim(),
                senha
            );

            if (result.error) {

                setError(
                    formatErrorMessage(
                        result.error,
                        "Nome ou senha incorretos."
                    )
                );

                return;
            }

            const usuario = result.data?.usuario;

            if (usuario) {
                saveUser(usuario);
            }

            navigate("/painel");

        } catch (error) {

            console.error(error);

            setError(
                formatErrorMessage(
                    error,
                    "Erro ao conectar ao servidor. Verifique se a API está disponível."
                )
            );

        } finally {

            setLoading(false);
        }
    }

    return (

        <div style={{ ...styles.container, ...(isDark ? styles.containerDark : {}) }}>

            <div style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>

                {/* LOGO */}
                <div style={styles.logoContainer}>

                    <div style={{ ...styles.logo, ...(isDark ? styles.logoDark : {}) }}>

                        <img
                            src="/logo.png"
                            alt="Adega do Nelson"
                            style={styles.logoImage}
                        />

                    </div>

                </div>

                {/* TÍTULO */}
                <h1 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>
                    Adega do Nelson
                </h1>

                <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                    Entre na sua conta para acessar o sistema.
                </p>

                <h2 style={{ ...styles.formTitle, ...(isDark ? styles.formTitleDark : {}) }}>
                    Login
                </h2>

                {/* ERRO */}
                {error && (

                    <div style={{ ...styles.alertError, ...(isDark ? styles.alertErrorDark : {}) }}>
                        {error}
                    </div>

                )}

                {/* FORMULÁRIO */}
                <form
                    style={styles.form}
                    onSubmit={entrar}
                >

                    {/* NOME */}
                    <div style={styles.inputGroup}>

                        <label style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Nome
                        </label>

                        <input
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(event) =>
                                setNome(event.target.value)
                            }
                            style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                            minLength={3}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* SENHA */}
                    <div style={styles.inputGroup}>

                        <label style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(event) =>
                                setSenha(event.target.value)
                            }
                            style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                            minLength={6}
                            required
                            disabled={loading}
                        />

                    </div>

                    {/* BOTÃO ENTRAR */}
                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {}),
                            ...(isDark ? styles.buttonDark : {})
                        }}
                        disabled={loading}
                    >
                        {loading
                            ? "Entrando..."
                            : "Entrar"
                        }

                    </button>

                </form>

                {/* IR PARA CADASTRO */}
                <div style={styles.registerText}>

                    <span style={{ ...(isDark ? styles.registerTextDark : {}) }}>
                        Não possui uma conta?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                        style={{ ...styles.registerLink, ...(isDark ? styles.registerLinkDark : {}) }}
                        disabled={loading}
                    >
                        Criar conta
                    </button>

                </div>

                {/* RODAPÉ */}
                <p style={{ ...styles.footer, ...(isDark ? styles.footerDark : {}) }}>
                    Sistema de gerenciamento da Adega do Nelson
                </p>

            </div>

        </div>
    );
}

const styles = {

    container: {
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
        transition: "background-color 0.3s ease"
    },

    containerDark: {
        backgroundColor: "#0f172a",
    },

    card: {
        width: "420px",
        maxWidth: "100%",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
        boxSizing: "border-box",
        transition: "background-color 0.3s ease, border-color 0.3s ease"
    },

    cardDark: {
        backgroundColor: "#111827",
        borderColor: "#374151",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
    },

    logoContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
    },

    logo: {
        width: "80px",
        height: "80px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid #e2e8f0"
    },

    logoDark: {
        borderColor: "#4b5563"
    },

    logoImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },

    title: {
        margin: 0,
        textAlign: "center",
        fontSize: "28px",
        fontWeight: 700,
        color: "#111827"
    },

    titleDark: {
        color: "#f9fafb"
    },

    subtitle: {
        margin: "12px 0 0",
        textAlign: "center",
        color: "#475569",
        fontSize: "15px"
    },

    subtitleDark: {
        color: "#d1d5db"
    },

    formTitle: {
        margin: "28px 0 18px",
        fontSize: "24px",
        fontWeight: 700,
        color: "#111827"
    },

    formTitleDark: {
        color: "#f9fafb"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },

    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },

    label: {
        fontWeight: 600,
        color: "#303e51",
        fontSize: "14px"
    },

    labelDark: {
        color: "#e5e7eb"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "10px",
        border: "1px solid #d7dfeb",
        padding: "12px 14px",
        fontSize: "14px",
        backgroundColor: "#ffffff",
        color: "#111827",
        outline: "none"
    },

    inputDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb"
    },

    button: {
        width: "100%",
        border: "none",
        borderRadius: "10px",
        padding: "12px 16px",
        backgroundColor: "#303e51",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 700,
        cursor: "pointer"
    },

    buttonDark: {
        backgroundColor: "#2563eb",
    },

    buttonDisabled: {
        opacity: 0.7,
        cursor: "not-allowed"
    },

    alertError: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#991b1b",
        borderRadius: "10px",
        padding: "12px 14px",
        fontSize: "14px",
        marginBottom: "18px"
    },

    alertErrorDark: {
        backgroundColor: "#3f1721",
        borderColor: "#7f1d1d",
        color: "#fecdd3",
    },

    registerText: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginTop: "18px",
        fontSize: "14px",
        color: "#475569"
    },

    registerTextDark: {
        color: "#d1d5db"
    },

    registerLink: {
        background: "transparent",
        border: "none",
        color: "#303e51",
        fontWeight: 600,
        cursor: "pointer",
        padding: 0
    },

    registerLinkDark: {
        color: "#93c5fd"
    },

    footer: {
        textAlign: "center",
        margin: "24px 0 0",
        fontSize: "13px",
        color: "#64748b"
    },

    footerDark: {
        color: "#cbd5e1"
    }
};