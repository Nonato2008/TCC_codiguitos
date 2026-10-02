import { Minus, Package2, Plus, Trash2 } from "lucide-react";

// ===== Helpers para lidar com produtos =====
// A API pode retornar campos em PascalCase (Id) ou camelCase (id).
// Esses helpers normalizam o acesso, evitando repetir `?? produto?.X ?? produto?.Y`.

function getIdProduto(produto) {
  return produto?.Id ?? produto?.id ?? produto?.idProduto;
}

function getNomeProduto(produto) {
  return produto?.Nome ?? produto?.nome ?? "Produto sem nome";
}

function getPrecoProduto(produto) {
  return Number(
    produto?.Preco ??
      produto?.preco ??
      produto?.Valor ??
      produto?.valor ??
      produto?.PrecoVenda ??
      produto?.precoVenda ??
      0
  );
}

function getEstoqueProduto(produto) {
  return Number(
    produto?.Quantidade ??
      produto?.quantidade ??
      produto?.Estoque ??
      produto?.estoque ??
      produto?.QuantidadeEstoque ??
      produto?.quantidadeEstoque ??
      produto?.Qtd ??
      produto?.qtd ??
      0
  );
}

// ===== Componente: Total da venda =====
// Só exibe o valor total formatado com 2 casas decimais.
export function TotalVenda({ totalGeral, itemCount, isDark }) {
  return (
    <div
      className="sale-entry-total"
      style={{
        ...styles.totalBox,
        ...(isDark ? styles.totalBoxDark : {}),
      }}
    >
      <div className="sale-entry-total-meta">
        <span
        style={{
          ...styles.totalLabel,
          ...(isDark ? styles.totalLabelDark : {}),
        }}
      >
        Total da venda
      </span>
        <span className="sale-entry-total-count">{itemCount} {itemCount === 1 ? "unidade" : "unidades"}</span>
      </div>
      <strong
        className="sale-entry-total-value"
        style={{
          ...styles.totalValue,
          ...(isDark ? styles.totalValueDark : {}),
        }}
      >
        {totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </strong>
    </div>
  );
}

// ===== Componente: Linha de item da venda =====
// Representa UMA linha do carrinho: select de produto + quantidade + subtotal + remover.
export function LinhaItemVenda({
  index,
  item,
  produto,
  alterarQuantidade,
  removerItem,
  isDark,
}) {
  const estoque = produto ? getEstoqueProduto(produto) : 0;
  const quantidade = Number(item.quantidade) || 1;
  const preco = Number(item.valorUnitario) || (produto ? getPrecoProduto(produto) : 0);
  const subtotal = preco * quantidade;

  return (
    <tr className={`sale-cart-row${isDark ? " is-dark" : ""}`}>
      <td>
        <div className="sale-cart-product">
          <span className="sale-cart-product-icon"><Package2 size={19} aria-hidden="true" /></span>
          <div><strong>{getNomeProduto(produto)}</strong><small>#{getIdProduto(produto)}</small></div>
        </div>
      </td>
      <td className="sale-cart-unit-price">{formatarMoeda(preco)}</td>
      <td><span className="sale-stock-pill">{estoque} disponíveis</span></td>
      <td>
        <div className="sale-quantity-stepper">
          <button type="button" aria-label={`Diminuir quantidade de ${getNomeProduto(produto)}`} disabled={quantidade <= 1} onClick={() => alterarQuantidade(index, quantidade - 1)}><Minus size={14} aria-hidden="true" /></button>
          <input type="number" min="1" max={estoque} value={quantidade} aria-label={`Quantidade de ${getNomeProduto(produto)}`} onChange={(event) => alterarQuantidade(index, event.target.value)} />
          <button type="button" aria-label={`Aumentar quantidade de ${getNomeProduto(produto)}`} disabled={quantidade >= estoque} onClick={() => alterarQuantidade(index, quantidade + 1)}><Plus size={14} aria-hidden="true" /></button>
        </div>
      </td>
      <td className="sale-cart-subtotal">{formatarMoeda(subtotal)}</td>
      <td><button type="button" className="sale-cart-remove" aria-label={`Remover ${getNomeProduto(produto)}`} onClick={() => removerItem(index)}><Trash2 size={16} aria-hidden="true" /></button></td>
    </tr>
  );
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const styles = {
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
  },
  selectDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  input: {
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#111c2d",
    fontFamily: "Inter, sans-serif",
  },
  inputDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  itemCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "8px",
    backgroundColor: "#f8fafc",
  },
  itemCardDark: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 90px 130px 42px",
    gap: "10px",
    alignItems: "center",
  },
  removeButton: {
    border: "1px solid #fecaca",
    backgroundColor: "#fff",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
  },
  removeButtonDark: {
    backgroundColor: "#3f1721",
    borderColor: "#7f1d1d",
    color: "#fecdd3",
  },
  removePlaceholder: { width: "42px", height: "38px" },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#f1f5f9",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  totalBoxDark: {
    backgroundColor: "#0b1220",
    borderColor: "#334155",
  },
  totalLabel: { color: "#303e51", fontWeight: 600, fontSize: "14px" },
  totalLabelDark: { color: "#cbd5e1" },
  totalValue: { color: "#111c2d", fontSize: "20px" },
  totalValueDark: { color: "#f9fafb" },
};
