import { codiguitos_api } from "./tcc.api";

export async function buscarUltimasVendas(limit = 3) {
  try {
    const response = await codiguitos_api.get("/vendas");

    const dados = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.result)
        ? response.data.result
        : [];

    const vendas = [];
    const idsProcessados = new Set();

    for (const venda of dados) {
      const id = venda?.Id ?? venda?.id;

      if (!id || idsProcessados.has(Number(id))) {
        continue;
      }

      idsProcessados.add(Number(id));
      vendas.push({
        id: Number(id),
        Id: Number(id),
        valorTotal: Number(venda?.ValorTotal ?? venda?.valorTotal ?? 0),
        ValorTotal: Number(venda?.ValorTotal ?? venda?.valorTotal ?? 0),
        dataCad: venda?.DataCad ?? venda?.dataCad ?? null,
        DataCad: venda?.DataCad ?? venda?.dataCad ?? null,
      });
    }

    return vendas
      .sort((a, b) => Number(b.id ?? b.Id) - Number(a.id ?? a.Id))
      .slice(0, limit);
  } catch (error) {
    console.error("Erro ao buscar últimas vendas:", error);
    return [];
  }
}
