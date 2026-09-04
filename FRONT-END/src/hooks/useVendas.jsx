import { useEffect, useState } from "react";
import api from "../services/tcc.api";

export function useVendas(limit = 3) {
  const [vendas, setVendas] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarVendas = async () => {
    try {
      setLoading(true);

      const response = await api.get("/vendas");

      const dados = Array.isArray(response.data) ? response.data : [];

      setVendas(dados.slice(0, limit));

      const total = dados.reduce(
        (soma, venda) => soma + Number(venda.ValorTotal || 0),
        0,
      );

      setValorTotal(total);
    } catch (err) {
      setError("Erro ao carregar vendas.");
      setVendas([]);
      setValorTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, [limit]);

  return {
    vendas,
    valorTotal,
    loading,
    error,
    carregarVendas,
  };
}
