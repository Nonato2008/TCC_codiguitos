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

export const buscarVendaId = async (id) => {
    try {
        const response = await codiguitos_api.get(`/vendas/${id}`);

        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados da venda:", error);
        throw error;
    }
};