import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="welcome-shell">
      <section className="welcome-layout">
        <img className="welcome-mark" src="/logo.png" alt="Adega do Nelson" />
        <div className="welcome-copy">
          <p className="welcome-eyebrow">Adega do Nelson</p>
          <h1>Gestão simples para o dia a dia da loja.</h1>
          <p className="welcome-description">
            Acesse vendas, produtos e estoque em um só lugar.
          </p>
          <Link className="welcome-action" to="/login">
            Entrar no sistema
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}