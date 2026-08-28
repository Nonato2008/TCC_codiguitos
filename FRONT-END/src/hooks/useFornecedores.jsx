import { useEffect, useState } from "react";
import { buscarFornecedores } from "../services/fornecedoresService";

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const carregarFornecedores = async () => {
      try {
        setLoading(true);
        setError(null);

        const dados = await buscarFornecedores();

        if (isMounted) {
          setFornecedores(dados);
        }
      } catch (error) {
        if (isMounted) {
          setError("Não foi possível carregar os fornecedores.");
          setFornecedores([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarFornecedores();

    return () => {
      isMounted = false;
    };
  }, []);

  return { fornecedores, loading, error };
}
