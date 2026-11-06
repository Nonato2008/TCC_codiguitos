import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

const funcionalidades = [
  {
    icone: "point_of_sale",
    titulo: "Vendas",
    texto: "Registre cada venda, escolha a forma de pagamento e emita a nota fiscal.",
  },
  {
    icone: "inventory",
    titulo: "Estoque",
    texto: "Veja o que ainda tem nas prateleiras e dê entrada no que acabou de chegar.",
  },
  {
    icone: "inventory_2",
    titulo: "Produtos",
    texto: "Cadastre cada produto com foto, preço e o fornecedor que entrega.",
  },
  {
    icone: "business",
    titulo: "Fornecedores",
    texto: "Mantenha os contatos de quem abastece a adega sempre à mão.",
  },
];

export default function Home() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="home">
      <style>{css}</style>

      <header className="home-header">
        <Link to="/home" className="home-brand" aria-label="Adega do Nelson, página inicial">
          <img src="/logo.png" alt="" className="home-brand-logo" />
          <span>Adega do Nelson</span>
        </Link>

        <nav className="home-nav" aria-label="Acesso">
          <button
            type="button"
            className="home-icon-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"}
          >
            <span className="material-symbols-outlined">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
          <Link to="/login" className="home-link">
            Entrar
          </Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-text">
            <h1>Vendas, estoque e fornecedores da adega num só lugar.</h1>
            <p>
              Registre as vendas do dia, confira o que falta nas prateleiras e
              saiba quanto a adega faturou, sem planilhas e sem caderno.
            </p>

            <div className="home-actions">
              <Link to="/login" className="home-btn home-btn-primary">
                Entrar no sistema
              </Link>
              <Link to="/cadastro" className="home-btn home-btn-secondary">
                Criar conta
              </Link>
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-logo-tile">
              <img src="/logo.png" alt="" />
            </div>
          </div>
        </section>

        <section className="home-features" aria-labelledby="home-features-title">
          <h2 id="home-features-title">O que você faz por aqui</h2>

          <ul>
            {funcionalidades.map((item) => (
              <li key={item.titulo}>
                <span className="material-symbols-outlined home-feature-icon" aria-hidden="true">
                  {item.icone}
                </span>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="home-footer">
        Sistema de gerenciamento da Adega do Nelson
      </footer>
    </div>
  );
}

const css = `
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-background);
  color: var(--text-primary);
  font-family: Inter, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.home > main,
.home-header,
.home-footer {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
  box-sizing: border-box;
}

.home > main { flex: 1; }

/* Cabeçalho */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
}

.home-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
}

.home-brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--border-color);
  background: #fff;
}

.home-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-link {
  padding: 10px 16px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--border-color);
  transition: border-color 0.2s ease, color 0.2s ease;
}

.home-link:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.home-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.home-icon-btn:hover { color: var(--text-primary); background: var(--surface-muted); }

/* Hero */
.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  align-items: center;
  gap: 48px;
  padding-top: 48px;
  padding-bottom: 72px;
}

.home-hero-text h1 {
  margin: 0 0 20px;
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
  max-width: 16em;
}

.home-hero-text p {
  margin: 0 0 32px;
  max-width: 34em;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-muted);
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.home-btn-primary {
  background-color: var(--accent-color);
  color: #fff;
}

.home-btn-primary:hover { background-color: var(--accent-hover); color: #fff; }

.home-btn-secondary {
  color: var(--text-primary);
  border-color: var(--border-color);
}

.home-btn-secondary:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.home-hero-visual {
  display: flex;
  justify-content: center;
  padding: 32px;
  border-radius: 24px;
  background-color: var(--accent-color);
}

.home-logo-tile {
  width: 100%;
  max-width: 340px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 20px;
  background: #fff;
}

.home-logo-tile img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Funcionalidades */
.home-features {
  padding-bottom: 72px;
}

.home-features h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.home-features ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 48px;
}

.home-features li {
  display: flex;
  gap: 16px;
  padding: 24px 0;
  border-top: 1px solid var(--border-color);
}

.home-feature-icon {
  flex: none;
  color: var(--accent-color);
  font-size: 28px;
}

.home-features h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
}

.home-features li p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}

/* Rodapé */
.home-footer {
  padding-top: 24px;
  padding-bottom: 24px;
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-muted);
}

/* Foco visível */
.home a:focus-visible,
.home button:focus-visible {
  outline: 3px solid var(--accent-color);
  outline-offset: 2px;
}

/* Telas menores */
@media (max-width: 820px) {
  .home-hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-top: 24px;
    padding-bottom: 48px;
  }

  .home-hero-visual { order: -1; padding: 20px; }
  .home-logo-tile { max-width: 220px; }
  .home-features ul { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .home-brand span { display: none; }
  .home-actions .home-btn { flex: 1 1 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .home, .home * { transition: none !important; }
}
`;