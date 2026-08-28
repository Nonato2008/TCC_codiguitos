import { useEffect, useState } from "react";
import { buscarProdutos } from "../services/produtosService";

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const carregarProdutos = async () => {
      try {
        setLoading(true);
        setError(null);

        const dados = await buscarProdutos();

        if (isMounted) {
          setProdutos(dados);
        }
      } catch (error) {
        if (isMounted) {
          setError("Não foi possível carregar os produtos.");
          setProdutos([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarProdutos();

    return () => {
      isMounted = false;
    };
  }, []);

  return { produtos, loading, error };
}
