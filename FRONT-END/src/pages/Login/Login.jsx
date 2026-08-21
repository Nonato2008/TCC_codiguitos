import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    function submit(e) {
        e.preventDefault();
        // autenticação simples de exemplo
        console.log("login", { email, password });
        nav("/"); // redireciona após login
    }

    return (
        <div className="container mt-4">
            <h1>Login</h1>
            <form onSubmit={submit} style={{ maxWidth: 480 }}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Senha</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit">Entrar</button>
            </form>
        </div>
    );
} 