import codiguitos_api from "./tcc.api";

export const buscarVendas = async () => {
    try {
        const response = await codiguitos_api.get("/vendas");

        return response.data;
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        throw error;
    }
};

export const buscarLucroReal = async () => {
    try {
        const response = await codiguitos_api.get("/vendas/lucro-real");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar histórico de lucro realizado:", error);
        throw error;
    }
};

export const buscarVendaId = async (id) => {
    try {
        const response = await codiguitos_api.get(`/vendas/${id}`);

        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados da venda:", error);
        throw error;
    }
};

export const deletarVenda = async (id) => {
    try {
        const response = await codiguitos_api.delete(`/vendas/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao deletar venda:", error);
        throw error;
    }
};

export const removerItemVenda = async (idVenda, idItem) => {
    try {
        const response = await codiguitos_api.delete(`/vendas/${idVenda}/item/${idItem}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao remover item da venda:", error);
        throw error;
    }
};
