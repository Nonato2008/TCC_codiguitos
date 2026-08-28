import { useEffect, useState } from "react";
import { buscarProdutos } from "../services/produtosService";

// Hook customizado para encapsular a lógica de busca de produtos,
// incluindo estados de carregamento e erro
export function useProdutos() {
  const [produtos, setProdutos] = useState([]); // lista de produtos carregados
  const [loading, setLoading] = useState(true); // indica se a busca está em andamento
  const [error, setError] = useState(null); // mensagem de erro, se houver

  useEffect(() => {
    // Flag para evitar atualização de estado após o componente ser desmontado
    // (evita o warning "Can't perform a React state update on an unmounted component")
    let isMounted = true;

    const carregarProdutos = async () => {
      try {
        setLoading(true);
        setError(null); // limpa erros de tentativas anteriores

        const dados = await buscarProdutos();

        // só atualiza o estado se o componente ainda estiver montado
        if (isMounted) {
          setProdutos(dados);
        }
      } catch (error) {
        if (isMounted) {
          setError("Não foi possível carregar os produtos.");
          setProdutos([]); // zera a lista em caso de falha
        }
      } finally {
        // garante que o loading seja desativado tanto em sucesso quanto em erro
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarProdutos();

    // cleanup: executado quando o componente desmonta ou o efeito é refeito
    return () => {
      isMounted = false;
    };
  }, []); // array vazio: executa apenas na montagem do componente

  // expõe os estados para o componente que consumir o hook
  return { produtos, loading, error };
}