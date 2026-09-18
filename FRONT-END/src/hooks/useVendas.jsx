import { useEffect, useState } from "react";
import { buscarVendas } from "../services/vendasService";

export function useVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const carregarVendas = async () => {
      try {
        setLoading(true);
        setError(null);

        const dados = await buscarVendas();
        const vendasUnicas = Array.isArray(dados)
          ? Object.values(
              dados.reduce((acc, venda) => {
                const id = venda.Id ?? venda.id;
                if (!id) return acc;
                if (!acc[id]) acc[id] = { ...venda };
                return acc;
              }, {})
            )
          : [];

        const vendasOrdenadas = vendasUnicas.sort((a, b) => {
          const dataA = new Date(a.DataCad ?? a.dataCad ?? a.Data ?? 0).getTime();
          const dataB = new Date(b.DataCad ?? b.dataCad ?? b.Data ?? 0).getTime();
          return dataB - dataA;
        });

        if (isMounted) {
          setVendas(vendasOrdenadas);
        }
      } catch (error) {
        if (isMounted) {
          setError("Não foi possível carregar as vendas.");
          setVendas([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarVendas();

    return () => {
      isMounted = false;
    };
  }, []);

  const valorTotal = Array.isArray(vendas)
    ? vendas.reduce((total, venda) => {
        const valor = Number(venda.ValorTotal || 0);
        return total + valor;
      }, 0)
    : 0;

  return { vendas, valorTotal, loading, error };
}
