import produtosRepository from "../repositories/produtosRepository.js";

class EntradaEstoqueController {

    async registrarEntrada(req, res) {
        try {
            const { idFornecedor, numeroNF, itens } = req.body;

            if (!idFornecedor) {
                return res.status(400).json({
                    mensagem: "Fornecedor não informado."
                });
            }

            if (!numeroNF || !String(numeroNF).trim()) {
                return res.status(400).json({
                    mensagem: "Número da Nota Fiscal não informado."
                });
            }

            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    mensagem: "É necessário informar pelo menos um produto."
                });
            }

            for (const item of itens) {
                if (!item.idProduto) {
                    return res.status(400).json({
                        mensagem: "Produto não informado."
                    });
                }

                if (
                    item.quantidade === undefined ||
                    !Number.isInteger(Number(item.quantidade)) ||
                    Number(item.quantidade) <= 0
                ) {
                    return res.status(400).json({
                        mensagem: "A quantidade de entrada deve ser um número inteiro maior que zero."
                    });
                }

                if (!item.numeroLote || !String(item.numeroLote).trim()) {
                    return res.status(400).json({
                        mensagem: "Número do lote não informado."
                    });
                }

                if (!item.dataVenc) {
                    return res.status(400).json({
                        mensagem: "A data de vencimento deve ser informada."
                    });
                }

                const dataVenc = new Date(`${item.dataVenc}T00:00:00`);
                if (Number.isNaN(dataVenc.getTime())) {
                    return res.status(400).json({
                        mensagem: "Data de vencimento inválida."
                    });
                }
            }

            const ids = itens.map(item => Number(item.idProduto));
            const idsDuplicados = ids.filter(
                (id, index) => ids.indexOf(id) !== index
            );

            if (idsDuplicados.length > 0) {
                return res.status(400).json({
                    mensagem:
                        "O mesmo produto não pode ser adicionado duas vezes na mesma entrada."
                });
            }

            const resultado = await produtosRepository.entradaMercadoria(itens);

            return res.status(200).json({
                ...resultado,
                numeroNF: String(numeroNF).trim(),
                idFornecedor: Number(idFornecedor),
                aviso:
                    "A quantidade e a validade foram atualizadas no estoque. O número da NF e do lote foram usados no fluxo, mas não são armazenados porque não existem campos para eles no banco atual."
            });

        } catch (error) {
            console.error("Erro ao registrar entrada:", error);

            return res.status(500).json({
                mensagem: "Erro ao registrar entrada de mercadorias.",
                erro: error.message
            });
        }
    }
}

export default new EntradaEstoqueController();
