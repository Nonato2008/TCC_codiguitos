
import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";
import { useVendas } from "../hooks/useVendas";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { buscarLucroReal } from "../services/vendasService";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function obterDataVenda(venda) {
  const valor = venda?.DataCad ?? venda?.dataCad ?? venda?.Data ?? venda?.data;
  if (!valor) return null;
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime())
      ? null
      : new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }

  const texto = String(valor).trim();
  const dataISOComFuso = texto.match(
    /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i
  );
  if (dataISOComFuso) {
    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) return null;
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  const dataISO = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dataISO) {
    return new Date(
      Number(dataISO[1]),
      Number(dataISO[2]) - 1,
      Number(dataISO[3])
    );
  }

  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) return null;
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export default function Painel() {
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { produtos, loading, error } = useProdutos();
  const [historicoLucro, setHistoricoLucro] = useState([]);
  const [loadingLucro, setLoadingLucro] = useState(true);
  const [erroLucro, setErroLucro] = useState("");

  useEffect(() => {
    let mounted = true;

    async function carregarLucroReal() {
      try {
        setLoadingLucro(true);
        setErroLucro("");
        const dados = await buscarLucroReal();

        if (!Array.isArray(dados)) {
          throw new Error("O servidor retornou um histórico de lucro inválido.");
        }

        if (mounted) setHistoricoLucro(dados);
      } catch (error) {
        console.error("Erro ao carregar lucro realizado:", error);
        if (mounted) {
          setErroLucro(
            error?.response?.data?.message ||
              error?.message ||
              "Não foi possível carregar o lucro realizado."
          );
        }
      } finally {
        if (mounted) setLoadingLucro(false);
      }
    }

    carregarLucroReal();
    return () => {
      mounted = false;
    };
  }, []);

  const {
    vendas,
    loading: loadingVendas,
    error: errorVendas,
  } = useVendas();

  const vendasLista = Array.isArray(vendas) ? vendas : [];
  const ultimasVendas = vendasLista.slice(0, 3);
  const produtosLista = Array.isArray(produtos) ? produtos : [];
  const produtosTotais = produtosLista.length;
  const hoje = new Date();
  const [periodoFaturamento, setPeriodoFaturamento] = useState("todo");
  const [mesFaturamento, setMesFaturamento] = useState(String(hoje.getMonth()));
  const [anoFaturamento, setAnoFaturamento] = useState(String(hoje.getFullYear()));

  const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const anosDisponiveis = [
    ...new Set([
      hoje.getFullYear(),
      ...vendasLista
        .map(obterDataVenda)
        .filter(Boolean)
        .map((data) => data.getFullYear()),
    ]),
  ].sort((a, b) => b - a);

  function correspondePeriodoFaturamento(venda) {
    if (periodoFaturamento === "todo") return true;

    const dataVenda = obterDataVenda(venda);
    if (!dataVenda) return false;

    if (periodoFaturamento === "semana") {
      const inicioSemana = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
      );
      const diasDesdeSegunda = (inicioSemana.getDay() + 6) % 7;
      inicioSemana.setDate(inicioSemana.getDate() - diasDesdeSegunda);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(fimSemana.getDate() + 7);
      return dataVenda >= inicioSemana && dataVenda < fimSemana;
    }

    if (periodoFaturamento === "mes") {
      return (
        dataVenda.getFullYear() === Number(anoFaturamento) &&
        dataVenda.getMonth() === Number(mesFaturamento)
      );
    }

    return dataVenda.getFullYear() === Number(anoFaturamento);
  }

  const vendasPeriodo = vendasLista.filter(correspondePeriodoFaturamento);
  const faturamentoPeriodoCentavos = vendasPeriodo.reduce((total, venda) => {
    const valor = Number(venda.ValorTotal ?? venda.valorTotal ?? 0);
    return Number.isFinite(valor)
      ? total + Math.round(valor * 100)
      : total;
  }, 0);
  const faturamentoPeriodo = faturamentoPeriodoCentavos / 100;

  const descricaoPeriodoFaturamento =
    periodoFaturamento === "todo"
      ? "Todo o período"
      : periodoFaturamento === "semana"
        ? "Esta semana (segunda a domingo)"
        : periodoFaturamento === "mes"
          ? `${MESES[Number(mesFaturamento)]} de ${anoFaturamento}`
          : `Ano de ${anoFaturamento}`;

  let lucroAcumuladoCentavos = 0;
  const lucroSerie = historicoLucro
    .map((item) => {
      const vendasComCusto = Number(item.VendasComCusto ?? 0);
      const lucroDia = Number(item.LucroDia ?? 0);
      if (!Number.isFinite(lucroDia) || !vendasComCusto) return null;

      const lucroDiaCentavos = Math.round(lucroDia * 100);
      lucroAcumuladoCentavos += lucroDiaCentavos;
      return {
        data: String(item.Data ?? ""),
        lucroDia: lucroDiaCentavos / 100,
        acumulado: lucroAcumuladoCentavos / 100,
      };
    })
    .filter(Boolean);
  const vendasSemCustoHistorico = historicoLucro.reduce(
    (total, item) => total + Number(item.VendasSemCusto ?? 0),
    0
  );
  const lucroRealTotal = lucroSerie.length
    ? lucroSerie[lucroSerie.length - 1].acumulado
    : 0;

  const chart = {
    width: 760,
    height: 280,
    left: 90,
    right: 24,
    top: 24,
    bottom: 228,
  };
  const chartPlotWidth = chart.width - chart.left - chart.right;
  const chartPlotHeight = chart.bottom - chart.top;
  const chartValues = lucroSerie.map((item) => item.acumulado);
  const chartMinOriginal = chartValues.reduce(
    (minimo, valor) => Math.min(minimo, valor),
    0
  );
  const chartMaxOriginal = chartValues.reduce(
    (maximo, valor) => Math.max(maximo, valor),
    0
  );
  const chartMin =
    chartMinOriginal === chartMaxOriginal
      ? chartMinOriginal - 1
      : chartMinOriginal;
  const chartMax =
    chartMinOriginal === chartMaxOriginal
      ? chartMaxOriginal + 1
      : chartMaxOriginal;
  const chartRange = chartMax - chartMin;
  const chartPoints = lucroSerie.map((item, index) => ({
    ...item,
    x:
      chart.left +
      (lucroSerie.length === 1
        ? chartPlotWidth / 2
        : (index / (lucroSerie.length - 1)) * chartPlotWidth),
    y:
      chart.top +
      ((chartMax - item.acumulado) / chartRange) * chartPlotHeight,
  }));
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const chartTickStep = Math.max(1, Math.ceil((chartPoints.length - 1) / 5));
  const chartDateTicks = chartPoints.filter(
    (point, index) =>
      index === 0 ||
      index === chartPoints.length - 1 ||
      index % chartTickStep === 0
  );
  const chartGridTicks = Array.from({ length: 5 }, (_, index) => {
    const value = chartMax - (chartRange * index) / 4;
    return {
      value,
      y: chart.top + (chartPlotHeight * index) / 4,
    };
  });
  const yZero =
    chart.top + ((chartMax - 0) / chartRange) * chartPlotHeight;

  function formatarDataGrafico(valor) {
    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
      return valor.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }

    const texto = String(valor);
    const dataISO = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dataISO) return `${dataISO[3]}/${dataISO[2]}`;

    const data = new Date(texto);
    return Number.isNaN(data.getTime())
      ? texto
      : data.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
  }

  const getDataVencimento = (produto) =>
    produto?.DataVenc ??
    produto?.dataVenc ??
    produto?.DataVencimento ??
    produto?.dataVencimento ??
    produto?.data_venc ??
    null;

  const isProdutoVencido = (produto) => {
    const status = String(produto?.Status ?? "").trim().toLowerCase();

    if (status === "vencido") return true;

    const dataVencimento = getDataVencimento(produto);
    if (!dataVencimento) return false;

    const data = new Date(`${dataVencimento}T00:00:00`);
    if (Number.isNaN(data.getTime())) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return data < hoje;
  };

  const produtosEsgotados = Array.isArray(produtos)
    ? produtos.filter((produto) => {
        const status = String(produto.Status ?? "").toLowerCase();
        return status === "esgotado";
      }).length
    : 0;

  const produtosVencimento = Array.isArray(produtos)
    ? produtos.filter(isProdutoVencido).length
    : 0;

  if (loading) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <div
            style={{
              ...styles.loadingBox,
              ...(isDark ? styles.loadingBoxDark : {}),
            }}
          >
            Carregando resumo do painel...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
        <Sidebar />

        <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
          <div
            style={{
              ...styles.errorBox,
              ...(isDark ? styles.errorBoxDark : {}),
            }}
          >
            {error}
          </div>
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
              <h2
                style={{
                  ...styles.title,
                  ...(isDark ? styles.titleDark : {}),
                }}
              >
                Visão Geral
              </h2>

              <p
                style={{
                  ...styles.subtitle,
                  ...(isDark ? styles.subtitleDark : {}),
                }}
              >
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
          <div
            style={{
              ...styles.largeCard,
              ...(isDark ? styles.largeCardDark : {}),
            }}
          >
            <div style={styles.cardHeader}>
              <h3
                style={{
                  ...styles.cardTitle,
                  ...(isDark ? styles.cardTitleDark : {}),
                }}
              >
                Vendas Recentes
              </h3>

              <button
                onClick={() => navigate("/vendas")}
                style={{
                  ...styles.linkButton,
                  ...(isDark ? styles.linkButtonDark : {}),
                }}
              >
                Ver todas
              </button>
            </div>

            {loadingVendas ? (
              <div
                style={{
                  ...styles.empty,
                  ...(isDark ? styles.emptyDark : {}),
                }}
              >
                <span className="material-symbols-outlined">
                  progress_activity
                </span>

                <span>Carregando vendas...</span>
              </div>
            ) : errorVendas ? (
              <div
                style={{
                  ...styles.empty,
                  ...(isDark ? styles.emptyDark : {}),
                }}
              >
                <span className="material-symbols-outlined">error</span>

                <span>{errorVendas}</span>
              </div>
            ) : vendasLista.length > 0 ? (
              <div style={styles.vendasLista}>
                {ultimasVendas.map((venda) => (
                  <div
                    key={venda.Id}
                    style={{
                      ...styles.vendaItem,
                      ...(isDark ? styles.vendaItemDark : {}),
                    }}
                  >
                    <div style={styles.vendaInfo}>
                      <strong
                        style={{
                          ...styles.vendaTitulo,
                          ...(isDark ? styles.vendaTituloDark : {}),
                        }}
                      >
                        Venda #{venda.Id}
                      </strong>

                      <span
                        style={{
                          ...styles.vendaVendedor,
                          ...(isDark ? styles.vendaVendedorDark : {}),
                        }}
                      >
                        Vendedor #{venda.IdVendedor}
                      </span>
                    </div>

                    <strong
                      style={{
                        ...styles.vendaValor,
                        ...(isDark ? styles.vendaValorDark : {}),
                      }}
                    >
                      R${" "}
                      {Number(venda.ValorTotal || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  ...styles.empty,
                  ...(isDark ? styles.emptyDark : {}),
                }}
              >
                <span className="material-symbols-outlined">
                  point_of_sale
                </span>

                <span>Nenhuma venda encontrada.</span>
              </div>
            )}
          </div>

          {/* FATURAMENTO TOTAL */}
          <div
            style={{
              ...styles.largeCard,
              ...(isDark ? styles.largeCardDark : {}),
            }}
          >
            <div style={styles.revenueHeader}>
              <h3
                style={{
                  ...styles.cardTitle,
                  ...(isDark ? styles.cardTitleDark : {}),
                }}
              >
                Faturamento total
              </h3>

              <div style={styles.revenueControls}>
                <label
                  htmlFor="periodo-faturamento"
                  style={{
                    ...styles.periodLabel,
                    ...(isDark ? styles.periodLabelDark : {}),
                  }}
                >
                  Período
                </label>
                <select
                  id="periodo-faturamento"
                  value={periodoFaturamento}
                  onChange={(event) => setPeriodoFaturamento(event.target.value)}
                  style={{
                    ...styles.periodSelect,
                    ...(isDark ? styles.periodSelectDark : {}),
                  }}
                >
                  <option value="todo">Todo</option>
                  <option value="semana">Semana atual</option>
                  <option value="mes">Mês</option>
                  <option value="ano">Ano</option>
                </select>

                {periodoFaturamento === "mes" && (
                  <select
                    aria-label="Mês do faturamento"
                    value={mesFaturamento}
                    onChange={(event) => setMesFaturamento(event.target.value)}
                    style={{
                      ...styles.periodSelect,
                      ...(isDark ? styles.periodSelectDark : {}),
                    }}
                  >
                    {MESES.map((mes, index) => (
                      <option key={mes} value={index}>
                        {mes}
                      </option>
                    ))}
                  </select>
                )}

                {(periodoFaturamento === "mes" ||
                  periodoFaturamento === "ano") && (
                  <select
                    aria-label="Ano do faturamento"
                    value={anoFaturamento}
                    onChange={(event) => setAnoFaturamento(event.target.value)}
                    style={{
                      ...styles.periodSelect,
                      ...(isDark ? styles.periodSelectDark : {}),
                    }}
                  >
                    {anosDisponiveis.map((ano) => (
                      <option key={ano} value={ano}>
                        {ano}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div style={styles.lucroContainer}>
              <strong style={{ ...styles.lucro, ...(isDark ? styles.lucroDark : {}) }}>
                {loadingVendas
                  ? "Carregando..."
                  : errorVendas
                    ? "Indisponível"
                    : formatarMoeda(faturamentoPeriodo)}
              </strong>
              <span style={{ ...styles.metricCaption, ...(isDark ? styles.metricCaptionDark : {}) }}>
                {descricaoPeriodoFaturamento}
              </span>
              {!loadingVendas && !errorVendas && (
                <span style={{ ...styles.metricCaption, ...(isDark ? styles.metricCaptionDark : {}) }}>
                  {vendasPeriodo.length} venda{vendasPeriodo.length === 1 ? "" : "s"} no período
                </span>
              )}
            </div>
          </div>
        </section>

        <section
          style={{
            ...styles.profitCard,
            ...(isDark ? styles.largeCardDark : {}),
          }}
          aria-labelledby="lucro-real-titulo"
        >
          <div style={styles.profitHeader}>
            <div>
              <h3
                id="lucro-real-titulo"
                style={{
                  ...styles.cardTitle,
                  ...(isDark ? styles.cardTitleDark : {}),
                }}
              >
                Lucro realizado acumulado
              </h3>
            </div>
            <strong
              style={{
                ...styles.profitTotal,
                ...(isDark ? styles.profitTotalDark : {}),
                ...(lucroRealTotal < 0 ? styles.profitNegative : {}),
              }}
              aria-live="polite"
            >
              {loadingLucro
                ? "Carregando..."
                : erroLucro
                  ? "Indisponível"
                  : formatarMoeda(lucroRealTotal)}
            </strong>
          </div>

          {loadingLucro ? (
            <div
              style={{
                ...styles.profitEmpty,
                ...(isDark ? styles.profitEmptyDark : {}),
              }}
            >
              Carregando histórico de lucro...
            </div>
          ) : erroLucro ? (
            <div
              style={{
                ...styles.profitError,
                ...(isDark ? styles.profitErrorDark : {}),
              }}
              role="alert"
            >
              {erroLucro}
              <br />
              Aplique a migration `BACK-END/migrations/20261101_add_custo_unitario_itens_vendas.sql` para habilitar o registro de custo por item vendido.
            </div>
          ) : chartPoints.length > 0 ? (
            <div
              style={styles.lineChartContainer}
              role="img"
              aria-label={`Gráfico de linha do lucro realizado acumulado por data. Total calculável: ${formatarMoeda(lucroRealTotal)}.`}
            >
              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                style={styles.lineChart}
                preserveAspectRatio="xMidYMid meet"
              >
                {chartGridTicks.map((tick, index) => (
                  <g key={`grid-${index}`}>
                    <line
                      x1={chart.left}
                      x2={chart.width - chart.right}
                      y1={tick.y}
                      y2={tick.y}
                      stroke={isDark ? "#374151" : "#e2e8f0"}
                      strokeWidth="1"
                    />
                    <text
                      x={chart.left - 10}
                      y={tick.y + 4}
                      textAnchor="end"
                      fill={isDark ? "#cbd5e1" : "#64748b"}
                      fontSize="11"
                    >
                      {formatarMoeda(tick.value)}
                    </text>
                  </g>
                ))}
                <line
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={yZero}
                  y2={yZero}
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                {chartPoints.length > 1 && (
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke={lucroRealTotal < 0 ? "#ef4444" : "#16a34a"}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
                {chartPoints.map((point) => (
                  <circle
                    key={`${point.data}-${point.x}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={lucroRealTotal < 0 ? "#ef4444" : "#16a34a"}
                  >
                    <title>
                      {formatarDataGrafico(point.data)} — lucro do dia:{" "}
                      {formatarMoeda(point.lucroDia)}; acumulado:{" "}
                      {formatarMoeda(point.acumulado)}
                    </title>
                  </circle>
                ))}
                {chartDateTicks.map((point) => (
                  <text
                    key={`date-${point.data}`}
                    x={point.x}
                    y={chart.height - 18}
                    textAnchor="middle"
                    fill={isDark ? "#cbd5e1" : "#64748b"}
                    fontSize="11"
                  >
                    {formatarDataGrafico(point.data)}
                  </text>
                ))}
              </svg>
            </div>
          ) : (
            <div
              style={{
                ...styles.profitEmpty,
                ...(isDark ? styles.profitEmptyDark : {}),
              }}
            >
                Ainda não há vendas com custo histórico registrado para calcular o lucro realizado.
            </div>
          )}
          {vendasSemCustoHistorico > 0 && !loadingLucro && !erroLucro && (
            <div
                style={{
                  ...styles.profitWarning,
                  ...(isDark ? styles.profitWarningDark : {}),
                }}
                role="status"
            >
                {vendasSemCustoHistorico === 1
                  ? "1 venda antiga não possui custo histórico registrado e não foi incluída no cálculo."
                  : `${vendasSemCustoHistorico} vendas antigas não possuem custo histórico registrado e não foram incluídas no cálculo.`}
            </div>
          )}
          <p
            style={{
                ...styles.profitFootnote,
              ...(isDark ? styles.profitFootnoteDark : {}),
            }}
          >
            Lucro bruto acumulado das vendas com custo unitário registrado; não inclui impostos ou outras despesas.
          </p>
        </section>
      </main>
    </div>
  );
}

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

          <h3
            style={{
              ...styles.cardLabel,
              ...(dark ? styles.cardLabelDark : {}),
            }}
          >
            {titulo}
          </h3>
        </div>

        <span className="material-symbols-outlined" style={styles.arrow}></span>
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
    backgroundColor: "var(--surface)",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },

  layoutDark: {
    backgroundColor: "var(--app-background)",
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
    backgroundColor: "var(--surface)",
    color: "#f3f4f6",
  },

  loadingBox: {
    minHeight: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    color: "#44474c",
    fontWeight: "600",
  },

  loadingBoxDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },

  card: {
    backgroundColor: "var(--surface)",
    padding: "24px",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    minHeight: "155px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  cardDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
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
    backgroundColor: "var(--surface-muted)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },

  largeCard: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    padding: "24px",
    minHeight: "260px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  largeCardDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  revenueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "12px",
  },

  revenueControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "8px",
  },

  periodLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
  },

  periodLabelDark: {
    color: "#cbd5e1",
  },

  periodSelect: {
    maxWidth: "100%",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
    color: "#243447",
    padding: "8px 10px",
    fontSize: "13px",
  },

  periodSelectDark: {
    borderColor: "var(--border-color)",
    backgroundColor: "var(--surface)",
    color: "#f9fafb",
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
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
  },

  vendaItemDark: {
    borderColor: "var(--border-color)",
    backgroundColor: "var(--surface)",
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

  lucroDark: {
    color: "#86efac",
  },

  lucroContainer: {
    minHeight: "170px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  metricCaption: {
    color: "#718096",
    fontSize: "13px",
    textAlign: "center",
  },

  metricCaptionDark: {
    color: "#cbd5e1",
  },

  profitCard: {
    marginTop: "24px",
    padding: "24px",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },

  profitHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },

  profitDescription: {
    margin: "8px 0 0",
    color: "#718096",
    fontSize: "14px",
  },

  profitDescriptionDark: {
    color: "#cbd5e1",
  },

  profitTotal: {
    color: "#047857",
    fontSize: "24px",
    whiteSpace: "nowrap",
  },

  profitTotalDark: {
    color: "#86efac",
  },

  profitNegative: {
    color: "#dc2626",
  },

  lineChartContainer: {
    width: "100%",
    overflowX: "auto",
  },

  lineChart: {
    display: "block",
    width: "100%",
    minWidth: "540px",
    height: "auto",
  },

  profitEmpty: {
    padding: "28px 16px",
    border: "1px dashed var(--border-color)",
    borderRadius: "8px",
    color: "#64748b",
    textAlign: "center",
  },

  profitEmptyDark: {
    borderColor: "var(--border-color)",
    color: "#cbd5e1",
  },

  profitError: {
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#fff1f2",
    color: "#9f1239",
    lineHeight: 1.6,
  },

  profitErrorDark: {
    backgroundColor: "#3f1721",
    color: "#fecdd3",
  },

  profitWarning: {
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: "#fffbeb",
    color: "#92400e",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  profitWarningDark: {
    backgroundColor: "#422006",
    color: "#fde68a",
  },

  profitFootnote: {
    margin: "18px 0 0",
    color: "#718096",
    fontSize: "12px",
  },

  profitFootnoteDark: {
    color: "#cbd5e1",
  },

};
