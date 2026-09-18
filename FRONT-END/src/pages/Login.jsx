import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    login as apiLogin,
    saveUser
} from "../services/authService.js";

export default function Login() {

    const navigate = useNavigate();

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
                    result.error.message ||
                    "Nome ou senha incorretos."
                );

                return;
            }

            const usuario = result.data?.usuario;

            if (!usuario) {
                setError(
                    "Não foi possível identificar o usuário."
                );
                return;
            }

            saveUser(usuario);

            navigate("/painel");

        } catch (error) {

            console.error(error);

            setError(
                "Erro ao conectar ao servidor."
            );

        } finally {

            setLoading(false);
        }
    }

    return (

        <div style={styles.container}>

            <div style={styles.card}>

                <div style={styles.logoContainer}>

                    <div style={styles.logo}>

                        <img
                            src="/logo.png"
                            alt="Adega do Nelson"
                            style={styles.logoImage}
                        />

                    </div>

                </div>

                <h1 style={styles.title}>
                    Adega do Nelson
                </h1>

                <p style={styles.subtitle}>
                    Entre na sua conta para acessar o sistema.
                </p>

                <h2 style={styles.formTitle}>
                    Login
                </h2>

                {error && (

                    <div style={styles.alertError}>
                        {error}
                    </div>

                )}

                <form
                    style={styles.form}
                    onSubmit={entrar}
                >

                    <div style={styles.inputGroup}>

                        <label style={styles.label}>
                            Nome
                        </label>

                        <input
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(event) =>
                                setNome(event.target.value)
                            }
                            style={styles.input}
                            minLength={3}
                            required
                            disabled={loading}
                        />

                    </div>

                    <div style={styles.inputGroup}>

                        <label style={styles.label}>
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(event) =>
                                setSenha(event.target.value)
                            }
                            style={styles.input}
                            minLength={6}
                            required
                            disabled={loading}
                        />

                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading
                                ? styles.buttonDisabled
                                : {})
                        }}
                        disabled={loading}
                    >
                        {loading
                            ? "Entrando..."
                            : "Entrar"
                        }
                    </button>

                </form>

                <div style={styles.registerText}>

                    <span>
                        Não possui uma conta?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                        style={styles.registerLink}
                        disabled={loading}
                    >
                        Criar conta
                    </button>

                </div>

                <p style={styles.footer}>
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
        boxSizing: "border-box"
    },

    card: {
        width: "420px",
        maxWidth: "100%",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
        boxSizing: "border-box"
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

    logoImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },

    title: {
        fontFamily: "Montserrat, sans-serif",
        textAlign: "center",
        fontSize: "28px",
        fontWeight: "700",
        color: "#303e51",
        margin: 0
    },

    subtitle: {
        textAlign: "center",
        color: "#44474c",
        fontSize: "14px",
        lineHeight: "1.5",
        marginTop: "8px",
        marginBottom: "28px"
    },

    formTitle: {
        textAlign: "center",
        fontSize: "20px",
        fontWeight: "700",
        color: "#303e51",
        marginTop: 0,
        marginBottom: "24px"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },

    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },

    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#303e51"
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 14px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        outline: "none",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#ffffff",
        color: "#303e51"
    },

    button: {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px",
        marginTop: "4px",
        border: "none",
        backgroundColor: "#303e51",
        color: "#ffffff",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },

    buttonDisabled: {
        opacity: 0.6,
        cursor: "not-allowed"
    },

    registerText: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        marginTop: "22px",
        color: "#44474c",
        fontSize: "14px"
    },

    registerLink: {
        color: "#303e51",
        fontWeight: "700",
        textDecoration: "none",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        fontSize: "14px",
        padding: 0
    },

    alertError: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "14px",
        marginBottom: "20px"
    },

    footer: {
        textAlign: "center",
        color: "#777b82",
        fontSize: "12px",
        marginTop: "28px",
        marginBottom: 0
    }
};