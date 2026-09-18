import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
    cadastro as apiCadastro
} from "../services/authService.js";
import { formatErrorMessage } from "../utils/formatErrorMessage";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Cadastro() {

    const navigate = useNavigate();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    // Estados dos campos do formulário
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [tipo, setTipo] = useState("VENDEDOR");

    // Estados de controle da requisição e feedback ao usuário
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function cadastrar(event) {

        event.preventDefault();

        setError("");
        setSuccess("");

        // Validações básicas do formulário antes de chamar a API
        if (!nome.trim()) {
            setError("Digite seu nome.");
            return;
        }

        if (nome.trim().length < 3) {
            setError(
                "O nome deve possuir pelo menos 3 caracteres."
            );
            return;
        }

        if (!senha) {
            setError("Digite uma senha.");
            return;
        }

        if (senha.length < 6) {
            setError(
                "A senha deve possuir pelo menos 6 caracteres."
            );
            return;
        }

        if (senha !== confirmarSenha) {
            setError(
                "As senhas não coincidem."
            );
            return;
        }

        setLoading(true);

        try {

            // Chama a API de cadastro com os dados do formulário
            const result = await apiCadastro(
                nome.trim(),
                senha,
                tipo
            );

            // Se a API retornar erro, exibe a mensagem formatada
            if (result.error) {

                setError(
                    formatErrorMessage(
                        result.error,
                        "Não foi possível realizar o cadastro."
                    )
                );

                return;
            }

            // Sucesso: limpa o formulário e redireciona para o login
            setSuccess(
                "Cadastro realizado com sucesso!"
            );

            setNome("");
            setSenha("");
            setConfirmarSenha("");
            setTipo("VENDEDOR");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            // Trata erros de conexão ou inesperados
            console.error(error);

            setError(
                formatErrorMessage(
                    error,
                    "Erro ao conectar ao servidor. Verifique se a API está disponível."
                )
            );

        } finally {

            // Sempre desativa o loading, independentemente do resultado
            setLoading(false);
        }
    }

    return (

        <div style={{ ...styles.container, ...(isDark ? styles.containerDark : {}) }}>

            <div style={{ ...styles.card, ...(isDark ? styles.cardDark : {}) }}>

                <div style={styles.logoContainer}>

                    <div style={{ ...styles.logo, ...(isDark ? styles.logoDark : {}) }}>

                        <img
                            src="/logo.png"
                            alt="Adega do Nelson"
                            style={styles.logoImage}
                        />

                    </div>

                </div>

                <h1 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>
                    Adega do Nelson
                </h1>

                <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                    Crie sua conta para acessar o sistema.
                </p>

                <h2 style={{ ...styles.formTitle, ...(isDark ? styles.formTitleDark : {}) }}>
                    Criar Cadastro
                </h2>

                {error && (
                    <div style={{ ...styles.alertError, ...(isDark ? styles.alertErrorDark : {}) }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ ...styles.alertSuccess, ...(isDark ? styles.alertSuccessDark : {}) }}>
                        {success}
                    </div>
                )}

                <form
                    style={styles.form}
                    onSubmit={cadastrar}
                >
                    <div style={styles.inputGroup}>
                        <label style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Nome
                        </label>

                        <input
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                            minLength={3}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                            minLength={6}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Confirmar Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Digite a senha novamente"
                            value={confirmarSenha}
                            onChange={(event) => setConfirmarSenha(event.target.value)}
                            style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                            minLength={6}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}>
                            Tipo de Usuário
                        </label>

                        <select
                            value={tipo}
                            onChange={(event) => setTipo(event.target.value)}
                            style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
                            disabled={loading}
                        >
                            <option value="VENDEDOR">Vendedor</option>
                            <option value="PROPRIETARIO">Proprietário</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {}),
                            ...(isDark ? styles.buttonDark : {})
                        }}
                        disabled={loading}
                    >
                        {loading ? "Cadastrando..." : "Criar conta"}
                    </button>
                </form>

                <div style={styles.registerText}>
                    <span style={{ ...(isDark ? styles.registerTextDark : {}) }}>
                        Já possui conta?
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        style={{ ...styles.registerLink, ...(isDark ? styles.registerLinkDark : {}) }}
                        disabled={loading}
                    >
                        Fazer login
                    </button>
                </div>
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
        transition: "background-color 0.3s ease",
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
        transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
    cardDark: {
        backgroundColor: "#111827",
        borderColor: "#374151",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
    },
    logoContainer: { display: "flex", justifyContent: "center", marginBottom: "20px" },
    logo: { width: "80px", height: "80px", borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0" },
    logoDark: { borderColor: "#4b5563" },
    logoImage: { width: "100%", height: "100%", objectFit: "cover" },
    title: { margin: 0, textAlign: "center", fontSize: "28px", fontWeight: 700, color: "#111827" },
    titleDark: { color: "#f9fafb" },
    subtitle: { margin: "12px 0 0", textAlign: "center", color: "#475569", fontSize: "15px" },
    subtitleDark: { color: "#d1d5db" },
    formTitle: { margin: "28px 0 18px", fontSize: "24px", fontWeight: 700, color: "#111827" },
    formTitleDark: { color: "#f9fafb" },
    form: { display: "flex", flexDirection: "column", gap: "18px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
    label: { fontWeight: 600, color: "#303e51", fontSize: "14px" },
    labelDark: { color: "#e5e7eb" },
    input: { width: "100%", boxSizing: "border-box", borderRadius: "10px", border: "1px solid #d7dfeb", padding: "12px 14px", fontSize: "14px", backgroundColor: "#ffffff", color: "#111827", outline: "none" },
    inputDark: { backgroundColor: "#1f2937", borderColor: "#4b5563", color: "#f9fafb" },
    button: { width: "100%", border: "none", borderRadius: "10px", padding: "12px 16px", backgroundColor: "#303e51", color: "#ffffff", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
    buttonDark: { backgroundColor: "#2563eb" },
    buttonDisabled: { opacity: 0.7, cursor: "not-allowed" },
    alertError: { backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", marginBottom: "18px" },
    alertErrorDark: { backgroundColor: "#3f1721", borderColor: "#7f1d1d", color: "#fecdd3" },
    alertSuccess: { backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", marginBottom: "18px" },
    alertSuccessDark: { backgroundColor: "#052e16", borderColor: "#14532d", color: "#bbf7d0" },
    registerText: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "18px", fontSize: "14px", color: "#475569" },
    registerTextDark: { color: "#d1d5db" },
    registerLink: { background: "transparent", border: "none", color: "#303e51", fontWeight: 600, cursor: "pointer", padding: 0 },
    registerLinkDark: { color: "#93c5fd" },
};