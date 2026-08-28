import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "40px", fontFamily: "Inter, sans-serif" }}>
      <h1>Home</h1>
      <p>Bem-vindo ao sistema.</p>
      <Link to="/login" style={{ display: "inline-block", marginTop: "16px" }}>
        Ir para Login
      </Link>
    </div>
  );
}