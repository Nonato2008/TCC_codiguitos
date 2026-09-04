import React from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos"; // hook customizado que busca a lista de produtos (provavelmente via API)
import { useNavigate } from "react-router-dom";

export default function Painel() {
  const navigate = useNavigate();

  // Hook retorna os produtos, estado de carregamento e possível erro na busca
  const { produtos, loading, error } = useProdutos();

  // Total de produtos cadastrados (tamanho do array)
  const produtosTotais = Array.isArray(produtos) ? produtos.length : 0;

  // Filtra produtos cujo Status seja "esgotado" (case-insensitive, com fallback para string vazia)
  const produtosEsgotados = Array.isArray(produtos)
    ? produtos.filter((produto) => {
        const status = String(produto.Status ?? "").toLowerCase();
        return status === "esgotado";
      }).length
    : 0;

  // Filtra produtos cujo Status seja "vencido"
  // Obs: a variável se chama "produtosVencimento" mas representa produtos VENCIDOS, não "a vencer"
  const produtosVencimento = Array.isArray(produtos)
    ? produtos.filter((produto) => {
        const status = String(produto.Status ?? "").toLowerCase();
        return status === "vencido";
      }).length
    : 0;

  // Estado de carregamento: mostra sidebar + mensagem central enquanto busca os dados
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

  // Estado de erro: mostra sidebar + caixa de erro em vermelho
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

  // Renderização principal (dados carregados com sucesso)
  return (
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.page}>
        {/* Cabeçalho da página */}
        <header style={styles.header}>
          <h2 style={styles.title}>Visão Geral</h2>
          <p style={styles.subtitle}>Resumo operacional da loja.</p>
        </header>

        {/* Cards de métricas rápidas (KPIs) */}
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
            tipo="error" // aplica estilo vermelho (borda e ícone)
          />

          <DashboardCard
            titulo="Produtos vencidos"
            valor={produtosVencimento}
            icone="event_busy"
            tipo="warning" // aplica estilo amarelo (borda e ícone)
          />
        </section>

        {/* Seção inferior com dois cards grandes lado a lado */}
        <section style={styles.bottom}>
          {/* Card de vendas recentes — ainda sem dados reais, só placeholder */}
          <div style={styles.largeCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Vendas Recentes</h3>
              <button onClick={() => navigate("/vendas")} style={styles.linkButton} >Ver todas</button>
            </div>

            <div style={styles.empty}>
              <span className="material-symbols-outlined">point_of_sale</span>
              <span>Nenhuma venda encontrada.</span>
            </div>
          </div>

          {/* Card de lucro total — também placeholder, sem cálculo real ainda */}
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

// Componente reutilizável para os cards de métricas do topo
function DashboardCard({ titulo, valor, icone, tipo }) {
  return (
    <div
      style={{
        ...styles.card,
        // Aplica estilos condicionais de acordo com o "tipo" do card
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

        {/* Seta decorativa, sugere que o card é clicável (mas não tem onClick implementado) */}
        <span className="material-symbols-outlined" style={styles.arrow}>
          arrow_forward
        </span>
      </div>

      {/* Valor numérico em destaque, muda de cor se for tipo "error" */}
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

// Objeto de estilos inline (CSS-in-JS manual, sem styled-components)
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f5f9",
  },

  page: {
    marginLeft: "256px", // compensa a largura fixa da Sidebar
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))", // 3 colunas iguais
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
    borderLeft: "4px solid #ba1a1a", // faixa vermelha à esquerda
  },

  warningCard: {
    borderLeft: "4px solid #eab308", // faixa amarela à esquerda
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
    backgroundColor: "#d5e3fc", // azul padrão
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
    color: "#ba1a1a", // valor em vermelho quando é card de erro
  },

  bottom: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))", // 2 colunas iguais
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