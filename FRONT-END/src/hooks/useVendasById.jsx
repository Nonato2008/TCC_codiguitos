import { useEffect, useState } from "react";
import { buscarVendaId } from "../services/vendasService";

export function useVendaById(id) {
    const [venda, setVenda] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const carregarVenda = async () => {
            try {
                setLoading(true);
                setError(null);

                const dados = await buscarVendaId(id);

                console.log("VENDA RECEBIDA:", dados);

                setVenda(dados);

            } catch (error) {
                console.error("Erro ao buscar venda:", error);

                setError("Não foi possível carregar a venda.");
                setVenda(null);

            } finally {
                setLoading(false);
            }
        };

        if (id) {
            carregarVenda();
        }
    }, [id]);

    return {
        venda,
        loading,
        error
    };
}