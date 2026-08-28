import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    login as apiLogin,
    cadastro as apiCadastro,
    saveUser
} from "../../services/authService.js";

export default function Login() {

    const [modoCadastro, setModoCadastro] = useState(false);

    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [tipo, setTipo] = useState("VENDEDOR");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    function limparMensagens() {
        setError("");
        setSuccess("");
    }

    function trocarModo() {

        limparMensagens();

        setNome("");
        setSenha("");
        setConfirmarSenha("");
        setTipo("VENDEDOR");

        setModoCadastro(!modoCadastro);
    }

    async function fazerLogin(event) {

        event.preventDefault();

        limparMensagens();
        setLoading(true);

        try {

            const result = await apiLogin(
                nome,
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

            if (usuario) {
                saveUser(usuario);
            }

            navigate("/");

        } catch (error) {

            setError(
                "Erro ao conectar ao servidor."
            );

        } finally {

            setLoading(false);
        }
    }

    async function fazerCadastro(event) {

        event.preventDefault();

        limparMensagens();

        if (senha !== confirmarSenha) {

            setError(
                "As senhas não coincidem."
            );

            return;
        }

        if (senha.length < 6) {

            setError(
                "A senha deve possuir pelo menos 6 caracteres."
            );

            return;
        }

        setLoading(true);

        try {

            const result = await apiCadastro(
                nome,
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

                setModoCadastro(false);
                setSuccess("");

            }, 1500);

        } catch (error) {

            setError(
                "Erro ao conectar ao servidor."
            );

        } finally {

            setLoading(false);
        }
    }

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: "100vh",
                background: "#f5f5f5"
            }}
        >

            <div
                className="card shadow p-4"
                style={{
                    width: "100%",
                    maxWidth: "450px"
                }}
            >

                <div className="text-center mb-4">

                    <h1 className="fw-bold">
                        Adega do Nelson
                    </h1>

                    <p className="text-muted">
                        Sistema de Gerenciamento
                    </p>

                </div>

                <h3 className="text-center mb-4">

                    {modoCadastro
                        ? "Criar Cadastro"
                        : "Login"
                    }

                </h3>

                <form
                    onSubmit={
                        modoCadastro
                            ? fazerCadastro
                            : fazerLogin
                    }
                >

                    <div className="mb-3">

                        <label className="form-label">
                            Nome
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(event) =>
                                setNome(event.target.value)
                            }
                            minLength={3}
                            required
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Senha
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(event) =>
                                setSenha(event.target.value)
                            }
                            minLength={6}
                            required
                        />

                    </div>

                    {modoCadastro && (

                        <>

                            <div className="mb-3">

                                <label className="form-label">
                                    Confirmar Senha
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Digite a senha novamente"
                                    value={confirmarSenha}
                                    onChange={(event) =>
                                        setConfirmarSenha(
                                            event.target.value
                                        )
                                    }
                                    minLength={6}
                                    required
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Tipo de Usuário
                                </label>

                                <select
                                    className="form-select"
                                    value={tipo}
                                    onChange={(event) =>
                                        setTipo(
                                            event.target.value
                                        )
                                    }
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

                    {error && (

                        <div className="alert alert-danger">
                            {error}
                        </div>

                    )}

                    {success && (

                        <div className="alert alert-success">
                            {success}
                        </div>

                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
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

                <div className="text-center mt-4">

                    <button
                        type="button"
                        className="btn btn-link"
                        onClick={trocarModo}
                    >

                        {modoCadastro
                            ? "Já possui uma conta? Fazer login"
                            : "Ainda não possui uma conta? Criar cadastro"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}
