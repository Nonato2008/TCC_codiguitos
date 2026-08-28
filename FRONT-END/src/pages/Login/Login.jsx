import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, saveToken } from "../../services/authService.js";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await apiLogin(email, password);
            if (result.error) {
                setError(result.error.message || "Credenciais inválidas");
                setLoading(false);
                return;
            }

            const data = result.data;
            const token = data?.token || data?.accessToken || null;
            if (token) saveToken(token);

            setLoading(false);
            nav("/");
        } catch (err) {
            setError("Erro ao conectar ao servidor");
            setLoading(false);
        }
    }

    return (
        <div className="container mt-4">
            <h1>Login</h1>
            <form onSubmit={submit} style={{ maxWidth: 480 }}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Senha</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}