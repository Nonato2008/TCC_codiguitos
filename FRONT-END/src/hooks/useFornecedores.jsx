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
        const idsDesativados = (() => {
          try {
            const salvos = JSON.parse(localStorage.getItem("fornecedoresDesativados") || "[]");
            return new Set((Array.isArray(salvos) ? salvos : []).map(Number).filter((id) => !Number.isNaN(id)));
          } catch {
            return new Set();
          }
        })();

        const normalizados = (Array.isArray(dados) ? dados : []).map((fornecedor) => ({
          ...fornecedor,
          ativo: !idsDesativados.has(Number(fornecedor.Id ?? fornecedor.id)),
        }));

        if (isMounted) {
          setFornecedores(normalizados);
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
