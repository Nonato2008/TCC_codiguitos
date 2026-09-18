import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { useVendas } from "../hooks/useVendas";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Painel() {

  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Hook que carrega os produtos (usado para os cards de resumo)
  const { produtos, loading, error } = useProdutos();

  // Hook que carrega as vendas e o valor total (lucro)
  const {
    vendas,
    valorTotal,
    loading: loadingVendas,
    error: errorVendas,
  } = useVendas();

  // Garante que `vendas` seja sempre um array válido
  const vendasLista = Array.isArray(vendas) ? vendas : [];

  // Pega as 3 últimas vendas e inverte para mostrar as mais recentes primeiro
  const ultimasVendas = [...vendasLista].slice(-3).reverse();

  // Total de produtos cadastrados
  const produtosTotais = Array.isArray(produtos) ? produtos.length : 0;

  // Conta produtos com status "esgotado"
  const produtosEsgotados = Array.isArray(produtos)
    ? produtos.filter((produto) => {
      const status = String(produto.Status ?? "").toLowerCase();
      return status === "esgotado";
    }).length
    : 0;

  // Conta produtos com status "vencido"
  const produtosVencimento = Array.isArray(produtos)
    ? produtos.filter((produto) => {
      const status = String(produto.Status ?? "").toLowerCase();
      return status === "vencido";
    }).length
    : 0;

  // Estado de carregamento dos produtos
  if (loading) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <div style={{ ...styles.loadingBox, ...(isDark ? styles.loadingBoxDark : {}) }}>
            Carregando resumo do painel...
          </div>
        </main>
      </div>
    );
  }

  // Estado de erro dos produtos
  if (error) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <div style={{ ...styles.errorBox, ...(isDark ? styles.errorBoxDark : {}) }}>{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        {/* CABEÇALHO */}
        <header style={styles.header}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>Visão Geral</h2>
              <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                Resumo operacional da loja.
              </p>
            </div>
          </div>
        </header>

        {/* CARDS */}
        <section style={styles.cards}>
          <DashboardCard
            titulo="Produtos Totais"
            valor={produtosTotais}
            icone="inventory"
            dark={isDark}
          />

          <DashboardCard
            titulo="Sem Estoque"
            valor={produtosEsgotados}
            icone="production_quantity_limits"
            tipo="error"
            dark={isDark}
          />

          <DashboardCard
            titulo="Produtos vencidos"
            valor={produtosVencimento}
            icone="event_busy"
            tipo="warning"
            dark={isDark}
          />
        </section>

        {/* PARTE INFERIOR */}
        <section style={styles.bottom}>
          {/* VENDAS RECENTES */}
          <div style={{ ...styles.largeCard, ...(isDark ? styles.largeCardDark : {}) }}>
            <div style={styles.cardHeader}>
              <h3 style={{ ...styles.cardTitle, ...(isDark ? styles.cardTitleDark : {}) }}>
                Vendas Recentes
              </h3>

              <button
                onClick={() => navigate("/vendas")}
                style={{ ...styles.linkButton, ...(isDark ? styles.linkButtonDark : {}) }}
              >
                Ver todas
              </button>
            </div>

            {loadingVendas ? (
              <div style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                <span className="material-symbols-outlined">
                  progress_activity
                </span>

                <span>Carregando vendas...</span>
              </div>
            ) : errorVendas ? (
              <div style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                <span className="material-symbols-outlined">error</span>

                <span>{errorVendas}</span>
              </div>
            ) : vendasLista.length > 0 ? (
              <div style={styles.vendasLista}>
                {ultimasVendas.map((venda) => (
                  <div key={venda.Id} style={{ ...styles.vendaItem, ...(isDark ? styles.vendaItemDark : {}) }}>
                    <div style={styles.vendaInfo}>
                      <strong style={{ ...styles.vendaTitulo, ...(isDark ? styles.vendaTituloDark : {}) }}>
                        Venda #{venda.Id}
                      </strong>

                      <span style={{ ...styles.vendaVendedor, ...(isDark ? styles.vendaVendedorDark : {}) }}>
                        Vendedor #{venda.IdVendedor}
                      </span>
                    </div>

                    <strong style={{ ...styles.vendaValor, ...(isDark ? styles.vendaValorDark : {}) }}>
                      R${" "}
                      {Number(venda.ValorTotal || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                <span className="material-symbols-outlined">point_of_sale</span>

                <span>Nenhuma venda encontrada.</span>
              </div>
            )}
          </div>

          {/* LUCRO TOTAL */}
          <div style={{ ...styles.largeCard, ...(isDark ? styles.largeCardDark : {}) }}>
            <div style={styles.cardHeader}>
              <h3 style={{ ...styles.cardTitle, ...(isDark ? styles.cardTitleDark : {}) }}>Lucro total</h3>

              <span className="material-symbols-outlined" style={isDark ? styles.iconDark : {}}>
                local_fire_department
              </span>
            </div>

            <div style={styles.lucroContainer}>
              <strong style={styles.lucro}>
                R$ {(valorTotal || 0).toFixed(2).replace(".", ",")}💸
              </strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Card reutilizável do topo do painel
// Aceita variações visuais através do `tipo` (error / warning)
function DashboardCard({ titulo, valor, icone, tipo, dark }) {
  return (
    <div
      style={{
        ...styles.card,
        ...(dark ? styles.cardDark : {}),
        ...(tipo === "error" ? styles.errorCard : {}),
        ...(tipo === "warning" ? styles.warningCard : {}),
      }}
    >
      <div style={styles.cardTop}>
        <div style={styles.cardName}>
          <div
            style={{
              ...styles.icon,
              ...(dark ? styles.iconDark : {}),
              ...(tipo === "error" ? styles.errorIcon : {}),
              ...(tipo === "warning" ? styles.warningIcon : {}),
            }}
          >
            <span className="material-symbols-outlined">{icone}</span>
          </div>

          <h3 style={{ ...styles.cardLabel, ...(dark ? styles.cardLabelDark : {}) }}>{titulo}</h3>
        </div>

        <span className="material-symbols-outlined" style={styles.arrow}>
        </span>
      </div>

      <strong
        style={{
          ...styles.value,
          ...(dark ? styles.valueDark : {}),
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
    transition: "background-color 0.3s ease, color 0.3s ease",
  },

  layoutDark: {
    backgroundColor: "#0f172a",
  },

  page: {
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px 32px 40px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },

  pageDark: {
    backgroundColor: "#111827",
    color: "#f3f4f6",
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

  loadingBoxDark: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
    color: "#f3f4f6",
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

  errorBoxDark: {
    backgroundColor: "#3f1721",
    borderColor: "#7f1d1d",
    color: "#fecdd3",
  },

  header: {
    marginBottom: "40px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },

  title: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: "32px",
    fontWeight: "700",
    margin: 0,
    color: "#111c2d",
  },

  titleDark: {
    color: "#f9fafb",
  },

  subtitle: {
    color: "#44474c",
    marginTop: "5px",
    marginBottom: 0,
  },

  subtitleDark: {
    color: "#d1d5db",
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
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  cardDark: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
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

  iconDark: {
    backgroundColor: "#2b3a4f",
    color: "#dbeafe",
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

  cardLabelDark: {
    color: "#e5e7eb",
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

  valueDark: {
    color: "#f9fafb",
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
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  largeCardDark: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
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

  cardTitleDark: {
    color: "#f9fafb",
  },

  linkButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#303e51",
    fontWeight: "600",
    cursor: "pointer",
  },

  linkButtonDark: {
    color: "#dbeafe",
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

  emptyDark: {
    color: "#d1d5db",
  },

  vendasLista: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  vendaItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },

  vendaItemDark: {
    borderColor: "#4b5563",
    backgroundColor: "#111827",
  },

  vendaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  vendaTitulo: {
    fontSize: "14px",
    color: "#111c2d",
  },

  vendaTituloDark: {
    color: "#f9fafb",
  },

  vendaVendedor: {
    fontSize: "12px",
    color: "#75777d",
  },

  vendaVendedorDark: {
    color: "#cbd5e1",
  },

  vendaValor: {
    fontSize: "15px",
    color: "#111c2d",
  },

  vendaValorDark: {
    color: "#f9fafb",
  },

  lucro: {
    fontSize: "38px",
    fontWeight: "700",
    color: "#06c100",
  },

  lucroContainer: {
    minHeight: "170px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};