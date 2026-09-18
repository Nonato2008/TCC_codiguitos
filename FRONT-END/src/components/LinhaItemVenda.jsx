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
export function TotalVenda({ totalGeral, isDark }) {
  return (
    <div
      style={{
        ...styles.totalBox,
        ...(isDark ? styles.totalBoxDark : {}),
      }}
    >
      <span
        style={{
          ...styles.totalLabel,
          ...(isDark ? styles.totalLabelDark : {}),
        }}
      >
        Total da venda
      </span>
      <strong
        style={{
          ...styles.totalValue,
          ...(isDark ? styles.totalValueDark : {}),
        }}
      >
        R$ {totalGeral.toFixed(2)}
      </strong>
    </div>
  );
}

// ===== Componente: Linha de item da venda =====
// Representa UMA linha do carrinho: select de produto + quantidade + subtotal + remover.
export function LinhaItemVenda({
  index,
  item,
  produtos,
  produtosFiltrados,
  idsUsadosEmOutrasLinhas,
  atualizarItem,
  removerItem,
  isDark,
}) {

  // Descobre o produto selecionado nesta linha e seu estoque atual
  const produtoAtual = produtos.find(
    (p) => Number(getIdProduto(p)) === Number(item.idProduto)
  );
  const estoqueAtual = produtoAtual ? getEstoqueProduto(produtoAtual) : undefined;

  // Marca a linha em amarelo quando a quantidade bate no limite do estoque
  const noLimite =
    estoqueAtual !== undefined && Number(item.quantidade) >= estoqueAtual;

  // Lista do select = filtrados + o produto atual (caso tenha saído do filtro)
  // Assim o item selecionado nunca some da lista por causa de um filtro
  const produtosParaSelect = [...produtosFiltrados];
  if (
    produtoAtual &&
    !produtosParaSelect.some(
      (p) => Number(getIdProduto(p)) === Number(item.idProduto)
    )
  ) {
    produtosParaSelect.unshift(produtoAtual);
  }

  return (
    <div
      key={index}
      style={{
        ...styles.itemCard,
        ...(isDark ? styles.itemCardDark : {}),
      }}
    >
      <div style={styles.itemRow}>
        {/* SELECT DE PRODUTO — desabilita itens sem estoque ou já usados em outra linha */}
        <select
          value={item.idProduto}
          onChange={(e) => atualizarItem(index, "idProduto", e.target.value)}
          style={{
            ...styles.select,
            ...(isDark ? styles.selectDark : {}),
          }}
        >
          <option value="">
            {produtos.length === 0
              ? "Nenhum produto cadastrado"
              : produtosParaSelect.length === 0
              ? "Nenhum produto encontrado"
              : "Selecione um produto..."}
          </option>
          {produtosParaSelect.map((produto) => {
            const id = getIdProduto(produto);
            const nome = getNomeProduto(produto);
            const preco = getPrecoProduto(produto);
            const estoque = getEstoqueProduto(produto);
            const semEstoque = estoque <= 0;
            const jaUsadoEmOutra = idsUsadosEmOutrasLinhas.includes(Number(id));

            return (
              <option
                key={id}
                value={id}
                disabled={semEstoque || jaUsadoEmOutra}
              >
                {nome} - R$ {preco.toFixed(2)}
                {jaUsadoEmOutra
                  ? " (já adicionado)"
                  : semEstoque
                  ? " (sem estoque)"
                  : ` • Estoque: ${estoque}`}
              </option>
            );
          })}
        </select>

        {/* QUANTIDADE — limitada ao estoque atual; borda amarela se atingiu o limite */}
        <input
          type="number"
          min="1"
          max={estoqueAtual ?? undefined}
          step="1"
          value={item.quantidade}
          onChange={(e) => atualizarItem(index, "quantidade", e.target.value)}
          style={{
            ...styles.input,
            ...(isDark ? styles.inputDark : {}),
            width: "90px",
            textAlign: "center",
            borderColor: noLimite
              ? "#f59e0b"
              : isDark
              ? "#4b5563"
              : "#cbd5e1",
          }}
          placeholder="Qtd"
          title={
            estoqueAtual !== undefined
              ? `Máximo disponível: ${estoqueAtual}`
              : undefined
          }
        />

        {/* SUBTOTAL — apenas leitura, já calculado pelo componente pai */}
        <input
          type="text"
          value={`R$ ${Number(item.valorTotal).toFixed(2)}`}
          readOnly
          style={{
            ...styles.input,
            ...(isDark ? styles.inputDark : {}),
            width: "130px",
            textAlign: "right",
            background: isDark ? "#0b1220" : "#f1f5f9",
          }}
        />

        {/* BOTÃO REMOVER — só aparece se houver mais de um produto na lista */}
        {produtos.length > 1 ? (
          <button
            type="button"
            style={{
              ...styles.removeButton,
              ...(isDark ? styles.removeButtonDark : {}),
            }}
            onClick={() => removerItem(index)}
            title="Remover produto"
          >
            ✕
          </button>
        ) : (
          <span style={styles.removePlaceholder} />
        )}
      </div>
    </div>
  );
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