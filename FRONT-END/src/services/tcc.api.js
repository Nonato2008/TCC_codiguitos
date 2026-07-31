import axios from "axios";
const API_URL = 'http://localhost:8000/produtos';

export async function buscarProdutos() {
    try {
        const resposta = await axios.get(API_URL);
        const items = resposta.data?.result ?? resposta.data ?? [];
        return items.map(item => ({
            id: item.idProduto ?? item.id,
            nome: item.nome,
            preco: item.valor ?? item.preco,
            descricao: item.descricao ,
            image: item.vinculoImagem ?? item.imagem ?? item.image,
            quantidade: item.quantidade ?? 0,
            fornecedor: item.idFornecedor,
            dataVencimento: item.dataVencimento
        }));
    } catch (error) {
        cconsole.error(error);

        app.innerHTML = `
        <h1>Erro ao carregar produtos</h1>
    `;
    }
}