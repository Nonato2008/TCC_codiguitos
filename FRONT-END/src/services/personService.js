import { buscarProdutos } from "./tcc.api";

export async function getAdega() {
    try {
        const response = await buscarProdutos.get("/produtos");
        
        return response.data
    } catch (error) {
        console.error("Erro ao buscar dados", error)

        return[]
    }
}