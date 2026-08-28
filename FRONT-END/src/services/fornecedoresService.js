import codiguitos_api from "./tcc.api";

export const buscarFornecedores = async () => {
    try {
        const response = await codiguitos_api.get("/fornecedores");

        console.log("API:", response.data);

        return response.data;
    } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        throw error;
    }
};

export const buscarFornecedorPorId = async (id) => {
    try {
        const response = await codiguitos_api.get(`/fornecedores/${id}`);

        return response.data;
    } catch (error) {
        console.error("Erro ao buscar fornecedor:", error);
        throw error;
    }
};

export const criarFornecedor = async (fornecedorData) => {
    try {
        const response = await codiguitos_api.post(
            "/fornecedores",
            fornecedorData
        );

        return response.data.result;

    } catch (error) {
        console.error("Erro ao criar fornecedor:", error);
        throw error;
    }
};

export const deletarFornecedor = async (id) => {
    try {
        const response = await codiguitos_api.delete(
            `/fornecedores/${id}`
        );

        return response.data;
    } catch (error) {
        console.error("Erro ao deletar fornecedor:", error);
        throw error;
    }
};