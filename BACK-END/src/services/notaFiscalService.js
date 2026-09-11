function gerarNumeroNota() {
    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    const segundo = String(data.getSeconds()).padStart(2, "0");

    return `${dia}${mes}${ano}${hora}${minuto}${segundo}`;
}

export function gerarNotaFiscal(produto) {
    const valorTotal =
        Number(produto.preco) * Number(produto.quantidade);

    return {
        numero: gerarNumeroNota(),
        dataEmissao: new Date().toISOString(),
        fornecedor: {
            id: Number(produto.idFornecedor)
        },
        produto: {
            nome: produto.nome,
            quantidade: Number(produto.quantidade),
            precoUnitario: Number(produto.preco),
            valorTotal: valorTotal
        },
        total: valorTotal
    };
}