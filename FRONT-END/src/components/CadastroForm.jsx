import { useState } from "react";
import {
    cadastro as apiCadastro
} from "../services/authService.js";

export default function CadastroForm({ onTrocarModo, isDark }) {

    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [tipo, setTipo] = useState("VENDEDOR");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function cadastrar(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

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
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const result = await apiCadastro(
                nome.trim(),
                senha,
                tipo
            );

            if (result.error) {
                setError(
                    result.error.message ||
                    "Não foi possível realizar o cadastro."
                );
                return;
            }

            setSuccess(
                "Cadastro realizado com sucesso! Agora faça login."
            );

            setNome("");
            setSenha("");
            setConfirmarSenha("");
            setTipo("VENDEDOR");
            setTimeout(() => {
                onTrocarModo();
                setSuccess("");
            }, 1500);

        } catch (error) {
            console.error(error);
            setError("Erro ao conectar ao servidor.");

        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h2 style={{
                ...styles.formTitle,
                ...(isDark ? styles.formTitleDark : {})
            }}>
                Criar Cadastro
            </h2>

            {error && (
                <div style={{
                    ...styles.alertError,
                    ...(isDark ? styles.alertErrorDark : {})
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    ...styles.alertSuccess,
                    ...(isDark ? styles.alertSuccessDark : {})
                }}>
                    {success}
                </div>
            )}

            <form
                style={styles.form}
                onSubmit={cadastrar}
            >

                <div style={styles.inputGroup}>
                    <label style={{
                        ...styles.label,
                        ...(isDark ? styles.labelDark : {})
                    }}>
                        Nome
                    </label>

                    <input
                        type="text"
                        placeholder="Digite seu nome"
                        value={nome}
                        onChange={(event) =>
                            setNome(event.target.value)
                        }
                        style={{
                            ...styles.input,
                            ...(isDark ? styles.inputDark : {})
                        }}
                        minLength={3}
                        required
                        disabled={loading}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={{
                        ...styles.label,
                        ...(isDark ? styles.labelDark : {})
                    }}>
                        Senha
                    </label>

                    <input
                        type="password"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(event) =>
                            setSenha(event.target.value)
                        }
                        style={{
                            ...styles.input,
                            ...(isDark ? styles.inputDark : {})
                        }}
                        minLength={6}
                        required
                        disabled={loading}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={{
                        ...styles.label,
                        ...(isDark ? styles.labelDark : {})
                    }}>
                        Confirmar Senha
                    </label>

                    <input
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={confirmarSenha}
                        onChange={(event) =>
                            setConfirmarSenha(event.target.value)
                        }
                        style={{
                            ...styles.input,
                            ...(isDark ? styles.inputDark : {})
                        }}
                        minLength={6}
                        required
                        disabled={loading}
                    />

                </div>
                <div style={styles.inputGroup}>

                    <label style={{
                        ...styles.label,
                        ...(isDark ? styles.labelDark : {})
                    }}>
                        Tipo de Usuário
                    </label>

                    <select
                        value={tipo}
                        onChange={(event) =>
                            setTipo(event.target.value)
                        }
                        style={{
                            ...styles.input,
                            ...(isDark ? styles.inputDark : {})
                        }}
                        disabled={loading}
                    >
                        <option value="VENDEDOR">
                            Vendedor
                        </option>

                        <option value="PROPRIETARIO">
                            Proprietário
                        </option>
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
                    {loading
                        ? "Cadastrando..."
                        : "Criar conta"
                    }
                </button>
            </form>

            <div style={styles.registerText}>
                <span style={{
                    ...(isDark ? styles.registerTextDark : {})
                }}>
                    Já possui uma conta?
                </span>

                <button
                    type="button"
                    onClick={onTrocarModo}
                    style={{
                        ...styles.registerLink,
                        ...(isDark ? styles.registerLinkDark : {})
                    }}
                    disabled={loading}
                >
                    Fazer login
                </button>
            </div>
        </>
    );
}

const styles = {
    formTitle: {
        textAlign: "center",
        fontSize: "20px",
        fontWeight: "700",
        color: "#303e51",
        marginTop: 0,
        marginBottom: "24px"
    },

    formTitleDark: {
        color: "#f9fafb"
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

    labelDark: {
        color: "#e5e7eb"
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

    inputDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb"
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

    buttonDark: {
        backgroundColor: "#2563eb"
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

    registerTextDark: {
        color: "#d1d5db"
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

    registerLinkDark: {
        color: "#93c5fd"
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

    alertErrorDark: {
        backgroundColor: "#3f1721",
        borderColor: "#7f1d1d",
        color: "#fecdd3"
    },

    alertSuccess: {
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        color: "#15803d",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "14px",
        marginBottom: "20px"
    },

    alertSuccessDark: {
        backgroundColor: "#052e16",
        borderColor: "#14532d",
        color: "#bbf7d0"
    }
};