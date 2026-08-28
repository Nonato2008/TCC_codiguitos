import React from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";

export default function Painel() {
  const { produtos, loading, error } = useProdutos();

  const produtosTotais = produtos.length;

  const produtosEsgotados = produtos.filter((produto) => {
    const status = String(produto.Status ?? "").toLowerCase();
    return status === "esgotado";
  }).length;

  const produtosVencimento = produtos.filter((produto) => {
    const status = String(produto.Status ?? "").toLowerCase();
    return status === "vencido";
  }).length;

  if (loading) {
    return (
      <div style={styles.layout}>
        <Sidebar />
        <main style={styles.page}>
          <div style={styles.loadingBox}>Carregando resumo do painel...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.layout}>
        <Sidebar />
        <main style={styles.page}>
          <div style={styles.errorBox}>{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.page}>
        <header style={styles.header}>
          <h2 style={styles.title}>Visão Geral</h2>
          <p style={styles.subtitle}>Resumo operacional da loja.</p>
        </header>

        <section style={styles.cards}>
          <DashboardCard
            titulo="Produtos Totais"
            valor={produtosTotais}
            icone="inventory"
          />

          <DashboardCard
            titulo="Sem Estoque"
            valor={produtosEsgotados}
            icone="production_quantity_limits"
            tipo="error"
          />

          <DashboardCard
            titulo="Produtos vencidos"
            valor={produtosVencimento}
            icone="event_busy"
            tipo="warning"
          />
        </section>

        <section style={styles.bottom}>
          <div style={styles.largeCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Vendas Recentes</h3>
              <button style={styles.linkButton}>Ver todas</button>
            </div>

            <div style={styles.empty}>
              <span className="material-symbols-outlined">point_of_sale</span>
              <span>Nenhuma venda encontrada.</span>
            </div>
          </div>

          <div style={styles.largeCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Lucro total</h3>
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>

            <div style={styles.empty}>
              <span className="material-symbols-outlined">inventory</span>
              <span>Nenhuma venda feita.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardCard({ titulo, valor, icone, tipo }) {
  return (
    <div
      style={{
        ...styles.card,
        ...(tipo === "error" ? styles.errorCard : {}),
        ...(tipo === "warning" ? styles.warningCard : {}),
      }}
    >
      <div style={styles.cardTop}>
        <div style={styles.cardName}>
          <div
            style={{
              ...styles.icon,
              ...(tipo === "error" ? styles.errorIcon : {}),
              ...(tipo === "warning" ? styles.warningIcon : {}),
            }}
          >
            <span className="material-symbols-outlined">{icone}</span>
          </div>

          <h3 style={styles.cardLabel}>{titulo}</h3>
        </div>

        <span className="material-symbols-outlined" style={styles.arrow}>
          arrow_forward
        </span>
      </div>

      <strong
        style={{
          ...styles.value,
          ...(tipo === "error" ? styles.errorValue : {}),
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f5f9",
  },

  page: {
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px 32px 40px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  },

  loadingBox: {
    minHeight: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9ff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#44474c",
    fontWeight: "600",
  },

  errorBox: {
    minHeight: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    color: "#9f1239",
    fontWeight: "600",
  },

  header: {
    marginBottom: "40px",
  },

  title: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: "32px",
    fontWeight: "700",
    margin: 0,
    color: "#111c2d",
  },

  subtitle: {
    color: "#44474c",
    marginTop: "5px",
    marginBottom: 0,
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },

  card: {
    backgroundColor: "#f9f9ff",
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    minHeight: "155px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },

  errorCard: {
    borderLeft: "4px solid #ba1a1a",
  },

  warningCard: {
    borderLeft: "4px solid #eab308",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardName: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  icon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#d5e3fc",
    color: "#303e51",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    backgroundColor: "#ffdad6",
    color: "#ba1a1a",
  },

  warningIcon: {
    backgroundColor: "#fef3c7",
    color: "#ca8a04",
  },

  cardLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#44474c",
    margin: 0,
  },

  arrow: {
    color: "#c4c6cd",
  },

  value: {
    display: "block",
    marginTop: "24px",
    fontSize: "38px",
    fontWeight: "700",
    color: "#111c2d",
  },

  errorValue: {
    color: "#ba1a1a",
  },

  bottom: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "24px",
  },

  largeCard: {
    backgroundColor: "#f9f9ff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "24px",
    minHeight: "260px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardTitle: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: "22px",
    margin: 0,
    color: "#111c2d",
  },

  linkButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#303e51",
    fontWeight: "600",
    cursor: "pointer",
  },

  empty: {
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#75777d",
  },
};
