import React from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Login() {

    const navigate = useNavigate();

    function entrar(event) {
        event.preventDefault();
        navigate("/painel");
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


                <form
                    style={styles.form}
                    onSubmit={entrar}
                >

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            E-mail
                        </label>

                        <input
                            type="email"
                            placeholder="Digite seu e-mail"
                            style={styles.input}
                            required
                        />
                    </div>


                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Senha
                        </label>

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            style={styles.input}
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Entrar
                    </button>

                </form>


                <div style={styles.registerText}>
                    <span>
                        Não possui uma conta?
                    </span>

                    <Link
                        to="/cadastro"
                        style={styles.registerLink}
                    >
                        Criar conta
                    </Link>
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
        marginBottom: "32px"
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
        fontFamily: "Inter, sans-serif"
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

    registerText: {
        display: "flex",
        justifyContent: "center",
        gap: "6px",
        marginTop: "22px",
        color: "#44474c",
        fontSize: "14px"
    },

    registerLink: {
        color: "#303e51",
        fontWeight: "700",
        textDecoration: "none"
    },

    footer: {
        textAlign: "center",
        color: "#777b82",
        fontSize: "12px",
        marginTop: "28px",
        marginBottom: 0
    }
};