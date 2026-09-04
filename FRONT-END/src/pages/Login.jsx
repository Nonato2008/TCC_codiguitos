import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    login as apiLogin,
    cadastro as apiCadastro,
    saveUser
} from "../services/authService.js";

// Tela de autenticação: alterna entre os modos "login" e "cadastro"
// usando o mesmo layout e formulário
export default function Login() {

    const navigate = useNavigate();

    // controla qual modo o formulário está exibindo (login ou cadastro)
    const [modoCadastro, setModoCadastro] = useState(false);

    // campos do formulário, compartilhados pelos dois modos
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState(""); // usado só no cadastro
    const [tipo, setTipo] = useState("VENDEDOR"); // usado só no cadastro

    const [loading, setLoading] = useState(false); // desabilita form durante requisição
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // limpa mensagens de erro/sucesso antes de uma nova tentativa
    function limparMensagens() {
        setError("");
        setSuccess("");
    }


    // alterna entre login/cadastro e reseta os campos do formulário
    function trocarModo() {

        limparMensagens();

        setNome("");
        setSenha("");
        setConfirmarSenha("");
        setTipo("VENDEDOR");

        setModoCadastro(!modoCadastro);
    }


    // submete o formulário de login
    async function entrar(event) {

        event.preventDefault(); // evita reload da página

        limparMensagens();

        // validações básicas antes de chamar a API
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

            // erro "de negócio" retornado pela API (não é exceção)
            if (result.error) {

                setError(
                    result.error.message ||
                    "Nome ou senha incorretos."
                );

                return;
            }

            const usuario = result.data?.usuario;

            // persiste o usuário logado (ex: localStorage) antes de navegar
            if (usuario) {
                saveUser(usuario);
            }

            navigate("/painel");

        } catch (error) {

            // erro inesperado (rede, servidor fora do ar, etc.)
            console.error(error);

            setError(
                "Erro ao conectar ao servidor."
            );

        } finally {

            // garante que o botão volte a ficar habilitado
            setLoading(false);
        }
    }


    // submete o formulário de cadastro
    async function cadastrar(event) {

        event.preventDefault();

        limparMensagens();

        // validações de campo, em ordem, cada uma interrompendo o fluxo
        if (!nome.trim()) {
            setError("Digite seu nome.");
            return;
        }

        if (nome.trim().length < 3) {
            setError("O nome deve possuir pelo menos 3 caracteres.");
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

            // limpa o formulário após sucesso
            setNome("");
            setSenha("");
            setConfirmarSenha("");
            setTipo("VENDEDOR");

            // após um pequeno delay, volta para o modo login automaticamente
            setTimeout(() => {

                setModoCadastro(false);
                setSuccess("");

            }, 1500);

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

                {/* LOGO */}
                <div style={styles.logoContainer}>

                    <div style={styles.logo}>

                        <img
                            src="/logo.png"
                            alt="Adega do Nelson"
                            style={styles.logoImage}
                        />

                    </div>

                </div>


                {/* TÍTULO */}
                <h1 style={styles.title}>
                    Adega do Nelson
                </h1>


                {/* Subtítulo muda de acordo com o modo atual */}
                <p style={styles.subtitle}>
                    {modoCadastro
                        ? "Crie sua conta para acessar o sistema."
                        : "Entre na sua conta para acessar o sistema."
                    }
                </p>


                {/* TÍTULO DO FORMULÁRIO */}
                <h2 style={styles.formTitle}>
                    {modoCadastro
                        ? "Criar Cadastro"
                        : "Login"
                    }
                </h2>


                {/* MENSAGEM DE ERRO (só renderiza se houver texto) */}
                {error && (
                    <div style={styles.alertError}>
                        {error}
                    </div>
                )}


                {/* MENSAGEM DE SUCESSO (só renderiza se houver texto) */}
                {success && (
                    <div style={styles.alertSuccess}>
                        {success}
                    </div>
                )}


                {/* FORMULÁRIO: o handler de submit muda conforme o modo */}
                <form
                    style={styles.form}
                    onSubmit={
                        modoCadastro
                            ? cadastrar
                            : entrar
                    }
                >

                    {/* NOME */}
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


                    {/* SENHA */}
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


                    {/* CAMPOS EXCLUSIVOS DO CADASTRO (renderização condicional) */}
                    {modoCadastro && (
                        <>

                            {/* CONFIRMAR SENHA */}
                            <div style={styles.inputGroup}>

                                <label style={styles.label}>
                                    Confirmar Senha
                                </label>

                                <input
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    value={confirmarSenha}
                                    onChange={(event) =>
                                        setConfirmarSenha(
                                            event.target.value
                                        )
                                    }
                                    style={styles.input}
                                    minLength={6}
                                    required
                                    disabled={loading}
                                />

                            </div>


                            {/* TIPO DE USUÁRIO */}
                            <div style={styles.inputGroup}>

                                <label style={styles.label}>
                                    Tipo de Usuário
                                </label>

                                <select
                                    value={tipo}
                                    onChange={(event) =>
                                        setTipo(event.target.value)
                                    }
                                    style={styles.input}
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

                        </>
                    )}


                    {/* BOTÃO: texto e estilo mudam conforme loading/modo */}
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
                            ? "Aguarde..."
                            : modoCadastro
                                ? "Cadastrar"
                                : "Entrar"
                        }

                    </button>

                </form>


                {/* ALTERNAR ENTRE LOGIN E CADASTRO */}
                <div style={styles.registerText}>

                    <span>

                        {modoCadastro
                            ? "Já possui uma conta?"
                            : "Não possui uma conta?"
                        }

                    </span>


                    <button
                        type="button" // evita submeter o form ao clicar
                        onClick={trocarModo}
                        style={styles.registerLink}
                        disabled={loading}
                    >

                        {modoCadastro
                            ? "Fazer login"
                            : "Criar conta"
                        }

                    </button>

                </div>


                {/* RODAPÉ */}
                <p style={styles.footer}>
                    Sistema de gerenciamento da Adega do Nelson
                </p>

            </div>

        </div>
    );
}


// Objeto de estilos inline, organizado por elemento da tela
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


    alertSuccess: {
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        color: "#15803d",
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