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
  
          if (isMounted) {
            setVendas(dados);
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
  
    return { vendas, loading, error };
  }