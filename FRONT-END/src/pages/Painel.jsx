import React, { useContext, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  Clock3,
  PackagePlus,
  PackageX,
  ReceiptText,
  ShoppingCart,
  UsersRound,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { useVendas } from "../hooks/useVendas";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Painel() {

  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("7dias");

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Hook que carrega os produtos (usado para os cards de resumo)
  const { produtos, loading, error } = useProdutos();

  // Hook que carrega as vendas e o valor total (lucro)
  const {
    vendas,
    loading: loadingVendas,
    error: errorVendas,
  } = useVendas();

  // Garante que `vendas` seja sempre um array válido
  const vendasLista = Array.isArray(vendas) ? vendas : [];

  const vendasPeriodo = useMemo(
    () => filtrarVendasPorPeriodo(vendasLista, periodo),
    [vendasLista, periodo]
  );

  const ultimasVendas = vendasPeriodo.slice(0, 3);
  const faturamentoPeriodo = vendasPeriodo.reduce(
    (total, venda) => total + Number(venda.ValorTotal || venda.valorTotal || 0),
    0
  );

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    usuario = null;
  }

  const nomeUsuario = usuario?.nome || usuario?.Nome || "";
  const horaAtual = new Date().getHours();
  const saudacao = horaAtual < 12 ? "Bom dia" : horaAtual < 18 ? "Boa tarde" : "Boa noite";

  // Total de produtos cadastrados
  const produtosTotais = Array.isArray(produtos) ? produtos.length : 0;

  // Conta produtos com status "esgotado"
  const produtosEsgotados = Array.isArray(produtos)
    ? produtos.filter((produto) => {
      const status = String(produto.Status ?? produto.status ?? "").toLowerCase();
      return status === "esgotado";
    }).length
    : 0;

  // Conta produtos com status "vencido"
  const produtosVencimento = Array.isArray(produtos)
    ? produtos.filter((produto) => {
      const status = String(produto.Status ?? produto.status ?? "").toLowerCase();
      return status === "vencido";
    }).length
    : 0;

  // Estado de carregamento dos produtos
  if (loading) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main className="dashboard-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
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

        <main className="dashboard-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <div style={{ ...styles.errorBox, ...(isDark ? styles.errorBoxDark : {}) }}>{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main className="dashboard-page" style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        {/* CABEÇALHO */}
        <header className="dashboard-header" style={styles.header}>
          <div className="dashboard-header__copy" style={styles.headerRow}>
            <div>
              <p className="dashboard-greeting">{saudacao}{nomeUsuario ? `, ${nomeUsuario}` : ""}</p>
              <h2 className="dashboard-title" style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}>Visão Geral</h2>
              <p style={{ ...styles.subtitle, ...(isDark ? styles.subtitleDark : {}) }}>
                Resumo operacional da loja.
              </p>
            </div>
            <label className="dashboard-period">
              <CalendarDays size={17} aria-hidden="true" />
              <span className="dashboard-period__label">Período</span>
              <select value={periodo} onChange={(event) => setPeriodo(event.target.value)}>
                <option value="hoje">Hoje</option>
                <option value="7dias">7 dias</option>
                <option value="30dias">30 dias</option>
                <option value="mes">Este mês</option>
              </select>
            </label>
          </div>
        </header>

        {/* CARDS */}
        <section className="dashboard-kpis" style={styles.cards}>
          <DashboardCard
            titulo="Produtos Totais"
            valor={produtosTotais}
            icone={<Boxes size={23} strokeWidth={1.8} />}
            tendencia="up"
            dark={isDark}
          />

          <DashboardCard
            titulo="Sem Estoque"
            valor={produtosEsgotados}
            icone={<PackageX size={23} strokeWidth={1.8} />}
            tendencia="down"
            tipo="error"
            alert={produtosEsgotados > 0}
            dark={isDark}
          />

          <DashboardCard
            titulo="Produtos vencidos"
            valor={produtosVencimento}
            icone={<Clock3 size={23} strokeWidth={1.8} />}
            tendencia="down"
            tipo="warning"
            alert={produtosVencimento > 0}
            dark={isDark}
          />
        </section>

        {/* PARTE INFERIOR */}
        <section className="dashboard-panels" style={styles.bottom}>
          {/* VENDAS RECENTES */}
          <div className="dashboard-panel" style={{ ...styles.largeCard, ...(isDark ? styles.largeCardDark : {}) }}>
            <div style={styles.cardHeader}>
              <h3 className="dashboard-card-title" style={{ ...styles.cardTitle, ...(isDark ? styles.cardTitleDark : {}) }}>
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
            ) : ultimasVendas.length > 0 ? (
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
              <div className="dashboard-empty" style={{ ...styles.empty, ...(isDark ? styles.emptyDark : {}) }}>
                <div className="dashboard-empty__icon">
                  <ReceiptText size={30} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <strong>{vendasLista.length ? "Sem vendas neste período" : "Ainda não há vendas registradas"}</strong>
                <span>{vendasLista.length ? "Escolha outro período ou consulte todas as vendas." : "Registre a primeira venda para começar a acompanhar o movimento da loja."}</span>
                <button
                  type="button"
                  className="dashboard-action-button"
                  onClick={() => navigate(vendasLista.length ? "/vendas" : "/vendas/cadastrar")}
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  {vendasLista.length ? "Ver todas as vendas" : "Registrar primeira venda"}
                </button>
              </div>
            )}
          </div>

          {/* FATURAMENTO TOTAL */}
          <div className="dashboard-profit" style={{ ...styles.largeCard, ...(isDark ? styles.largeCardDark : {}) }}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={{ ...styles.cardTitle, ...(isDark ? styles.cardTitleDark : {}) }}>Faturamento no período</h3>
                <span className="dashboard-profit__period">{periodoLabel(periodo)}</span>
              </div>

              <div className="dashboard-profit__icon"><Activity size={19} aria-hidden="true" /></div>
            </div>

            <div style={styles.lucroContainer}>
              <strong className={`dashboard-profit__value${faturamentoPeriodo < 0 ? " is-negative" : ""}`}>
                {formatarMoeda(faturamentoPeriodo)}
              </strong>
            </div>
            <SalesMiniChart sales={vendasPeriodo} />
            <p className="dashboard-profit__footnote">{faturamentoPeriodo < 0 ? "Saldo negativo" : "Total das vendas registradas"}; não representa lucro líquido.</p>
          </div>
        </section>

        <section className="dashboard-quick-actions" aria-labelledby="dashboard-quick-actions-title">
          <div className="dashboard-quick-actions__heading">
            <div>
              <span className="dashboard-section-kicker">Atalhos</span>
              <h3 id="dashboard-quick-actions-title">Ações rápidas</h3>
            </div>
            <span>Operações frequentes</span>
          </div>
          <div className="dashboard-quick-actions__items">
            <QuickAction icon={<ShoppingCart size={19} />} label="Nova venda" onClick={() => navigate("/vendas/cadastrar")} />
            <QuickAction icon={<Boxes size={19} />} label="Ajustar estoque" onClick={() => navigate("/gerenciamentoEstoque")} />
            {(usuario?.perfil || usuario?.Perfil || usuario?.tipo || "").toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "PROPRIETARIO" && (
              <>
                <QuickAction icon={<PackagePlus size={19} />} label="Adicionar produto" onClick={() => navigate("/produtos/cadastrar")} />
                <QuickAction icon={<UsersRound size={19} />} label="Cadastrar fornecedor" onClick={() => navigate("/fornecedores/cadastrar")} />
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Card reutilizável do topo do painel
// Aceita variações visuais através do `tipo` (error / warning)
function DashboardCard({ titulo, valor, icone, tipo, tendencia, alert, dark }) {
  const TrendIcon = tendencia === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div
      className={`dashboard-kpi dashboard-kpi--${tipo || "default"}${alert ? " dashboard-kpi--alert" : ""}`}
      style={{
        ...styles.card,
        ...(dark ? styles.cardDark : {}),
      }}
    >
      <div style={styles.cardTop}>
        <div style={styles.cardName}>
          <div
            className="dashboard-kpi__icon"
            style={{
              ...styles.icon,
              ...(dark ? styles.iconDark : {}),
            }}
          >
            {icone}
          </div>

          <h3 className="dashboard-kpi__label" style={{ ...styles.cardLabel, ...(dark ? styles.cardLabelDark : {}) }}>{titulo}</h3>
        </div>

        <span className="dashboard-kpi__trend" title="Indicador inicial; ainda sem histórico para comparação">
          <TrendIcon size={15} aria-hidden="true" />
          <span>0%</span>
        </span>
      </div>

      <strong
        className="dashboard-kpi__value"
        style={{
          ...styles.value,
          ...(dark ? styles.valueDark : {}),
        }}
      >
        {valor}
      </strong>
    </div>
  );
}

function filtrarVendasPorPeriodo(vendas, periodo) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicio = new Date(hoje);

  if (periodo === "7dias") inicio.setDate(inicio.getDate() - 6);
  if (periodo === "30dias") inicio.setDate(inicio.getDate() - 29);
  if (periodo === "mes") inicio.setDate(1);

  return vendas
    .filter((venda) => {
      const dataVenda = venda.DataCad ?? venda.dataCad ?? venda.Data ?? venda.data;
      if (!dataVenda) return false;

      const data = parseDateLocal(dataVenda);
      if (Number.isNaN(data.getTime())) return false;
      data.setHours(0, 0, 0, 0);
      return data >= inicio && data <= hoje;
    })
    .sort((a, b) => {
      const dataA = parseDateLocal(a.DataCad ?? a.dataCad ?? a.Data ?? a.data)?.getTime() ?? 0;
      const dataB = parseDateLocal(b.DataCad ?? b.dataCad ?? b.Data ?? b.data)?.getTime() ?? 0;
      return dataB - dataA;
    });
}

function parseDateLocal(value) {
  if (!value) return null;
  const datePart = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = datePart
    ? new Date(Number(datePart[1]), Number(datePart[2]) - 1, Number(datePart[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function periodoLabel(periodo) {
  return {
    hoje: "Hoje",
    "7dias": "Últimos 7 dias",
    "30dias": "Últimos 30 dias",
    mes: "Este mês",
  }[periodo];
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function SalesMiniChart({ sales }) {
  const values = [...sales]
    .reverse()
    .map((sale) => Number(sale.ValorTotal ?? sale.valorTotal ?? 0));
  const chartValues = values.length > 1 ? values : [0, ...(values.length ? values : [0])];
  const maxValue = Math.max(...chartValues, 1);
  const points = chartValues
    .map((value, index) => {
      const x = (index / Math.max(chartValues.length - 1, 1)) * 100;
      const y = 40 - (value / maxValue) * 32;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="dashboard-sparkline" aria-label="Gráfico das vendas no período">
      <svg viewBox="0 0 100 44" preserveAspectRatio="none" role="img" aria-hidden="true">
        <path className="dashboard-sparkline__baseline" d="M0 41H100" />
        <polyline className="dashboard-sparkline__line" points={points} />
      </svg>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button type="button" className="dashboard-quick-action" onClick={onClick}>
      <span className="dashboard-quick-action__icon">{icon}</span>
      <span>{label}</span>
      <ArrowRight className="dashboard-quick-action__arrow" size={16} aria-hidden="true" />
    </button>
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