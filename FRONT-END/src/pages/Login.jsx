import { useState, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import LoginForm from "../components/LoginForm.jsx";
import CadastroForm from "../components/CadastroForm.jsx";

export default function Login() {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const [modoCadastro, setModoCadastro] = useState(false);

    function trocarModo() {
        setModoCadastro(!modoCadastro);
    }

    return (
        <div style={{
            ...styles.container,
            ...(isDark ? styles.containerDark : {})
        }}>

            <div style={{
                ...styles.card,
                ...(isDark ? styles.cardDark : {})
            }}>

                <div style={styles.logoContainer}>
                    <div style={{
                        ...styles.logo,
                        ...(isDark ? styles.logoDark : {})
                    }}>

                        <img
                            src="/logo.png"
                            alt="Adega do Nelson"
                            style={styles.logoImage}
                        />
                    </div>
                </div>

                <h1 style={{
                    ...styles.title,
                    ...(isDark ? styles.titleDark : {})
                }}>
                    Adega do Nelson
                </h1>

                <p style={{
                    ...styles.subtitle,
                    ...(isDark ? styles.subtitleDark : {})
                }}>
                    {modoCadastro
                        ? "Crie sua conta para acessar o sistema."
                        : "Entre na sua conta para acessar o sistema."
                    }
                </p>

                {modoCadastro ? (
                    <CadastroForm
                        onTrocarModo={trocarModo}
                        isDark={isDark}
                    />
                ) : (
                    <LoginForm
                        onTrocarModo={trocarModo}
                        isDark={isDark}
                    />
                )}

                <p style={{
                    ...styles.footer,
                    ...(isDark ? styles.footerDark : {})
                }}>
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
        backgroundColor: "#0f172a"
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
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)"
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
        fontFamily: "Montserrat, sans-serif",
        textAlign: "center",
        fontSize: "28px",
        fontWeight: "700",
        color: "#303e51",
        margin: 0
    },

    titleDark: {
        color: "#f9fafb"
    },

    subtitle: {
        textAlign: "center",
        color: "#44474c",
        fontSize: "14px",
        lineHeight: "1.5",
        marginTop: "8px",
        marginBottom: "28px"
    },

    subtitleDark: {
        color: "#d1d5db"
    },

    footer: {
        textAlign: "center",
        color: "#777b82",
        fontSize: "12px",
        marginTop: "28px",
        marginBottom: 0
    },

    footerDark: {
        color: "#9ca3af"
    }
};