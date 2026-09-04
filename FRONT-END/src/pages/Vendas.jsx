import React from "react";
import Sidebar from "../components/Sidebar";

const vendasMock = [];

export default function Vendas() {
  return (
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.page}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Operações</p>
            <h1 style={styles.title}>Vendas</h1>
          </div>
        </header>


        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Últimas vendas</h2>
            <button type="button" style={styles.secondaryButton}>
              Filtrar
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Produto</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendasMock.map((venda) => (
                  <tr key={venda.id}>
                    <td style={styles.td}>{venda.produto}</td>
                    <td style={styles.td}>{venda.total}</td>
                    <td style={styles.td}>
                      <span
                        style={{}}
                      >
                        {venda.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
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
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    gap: "16px",
  },

  eyebrow: {
    margin: 0,
    color: "#6b7280",
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },

  title: {
    margin: "8px 0 0",
    color: "#111827",
    fontSize: "32px",
    fontWeight: 700,
  },

  primaryButton: {
    border: "none",
    backgroundColor: "#303e51",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },

  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "18px 20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },

  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "8px",
  },

  cardValue: {
    fontSize: "28px",
    color: "#111827",
  },

  panel: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  secondaryButton: {
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    color: "#374151",
    padding: "9px 14px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    color: "#374151",
    fontSize: "13px",
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#111827",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },

  badgePaid: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },

  badgePending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
};
