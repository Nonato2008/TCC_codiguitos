<<<<<<< HEAD
import axios from "axios";

const API_URL = "http://localhost:8000/produtos";

export async function buscarProdutos() {
    try {
        const resposta = await axios.get(API_URL);

        console.log("Resposta da API:", resposta.data);

        const items = resposta.data?.result ?? resposta.data ?? [];

        return items.map(item => ({
            id: item.Id ?? item.idProduto ?? item.id,
            nome: item.Nome ?? item.nome,
            preco: item.Preco ?? item.valor ?? item.preco,
            descricao: item.Descricao ?? item.descricao,
            image: item.Imagem ?? item.vinculoImagem ?? item.imagem ?? item.image,
            quantidade: item.Quantidade ?? item.quantidade ?? 0,
            fornecedor: item.IdFornecedor ?? item.idFornecedor,
            dataVencimento: item.DataVenc ?? item.dataVencimento
        }));

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        throw error;
=======
/*import axios from "axios";

export const codiguitos_api = axios.create (
    {
        baseURL: "http://localhost:8000",
        timeout: 5000
>>>>>>> a064cb4b9715c909259d3be1d48a9fb63ad919cc
    }
)*/