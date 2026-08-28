import { codiguitos_api } from "./tcc.api";

export async function buscarProdutos() {
  try {
    const response = await codiguitos_api.get("/produtos");

    if (Array.isArray(response.data?.result)) {
      return response.data.result;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}
