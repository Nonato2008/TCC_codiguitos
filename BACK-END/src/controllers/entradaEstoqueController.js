import produtosRepository from "../repositories/produtosRepository.js";

class EntradaEstoqueController {

    async registrarEntrada(req, res) {

        try {

            const { itens } = req.body;

            if (!itens || !Array.isArray(itens) || itens.length === 0) {

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
                    Number(item.quantidade) <= 0
                ) {

                    return res.status(400).json({
                        mensagem:
                            "A quantidade de entrada deve ser maior que zero."
                    });

                }

                if (!item.dataVenc) {

                    return res.status(400).json({
                        mensagem:
                            "A data de vencimento deve ser informada."
                    });

                }
            }

            // Evita que o mesmo produto seja inserido duas vezes
            // na mesma entrada com datas diferentes.
            const produtos = itens.map(item => item.idProduto);

            const produtosDuplicados = produtos.filter(
                (id, index) => produtos.indexOf(id) !== index
            );

            if (produtosDuplicados.length > 0) {

                return res.status(400).json({
                    mensagem:
                        "O mesmo produto não pode ser adicionado duas vezes na mesma entrada."
                });
            }

            const resultado =
                await produtosRepository.entradaMercadoria(itens);

            return res.status(200).json(resultado);

        } catch (error) {

            console.error(
                "Erro ao registrar entrada:",
                error
            );

            return res.status(500).json({
                mensagem: "Erro ao registrar entrada de mercadorias.",
                erro: error.message
            });
        }
    }
}

export default new EntradaEstoqueController();