import codiguitos_api from "./tcc.api";

export const buscarfornecedores = async () => {
    try {
        const response = await codiguitos_api.get("/fornecedores");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        throw error;
    }
};