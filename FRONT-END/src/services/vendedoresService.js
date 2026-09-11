import codiguitos_api from "./tcc.api";

export const buscarVendedores = async () => {
    try {
        const response = await codiguitos_api.get("/vendedores");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar vendedores:", error);
        throw error;
    }
};