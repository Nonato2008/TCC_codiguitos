import { statusPed } from "../enums/statusVenda.js";
import { Produtos } from "../models/Produtos.js";
import produtosRepository from "../repositories/produtosRepository.js";

const calcularStatus = (quantidade, dataVenc) => {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(dataVenc);
    vencimento.setHours(0, 0, 0, 0);

    if (vencimento < hoje) {
        return statusPed.VENCIDO;
    }
    if (Number(quantidade) <= 0) {
        return statusPed.ESGOTADO;
    }
    return statusPed.ESTOQUE;
};

const produtoController = {

    inserir: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "Imagem não foi enviada"
                });
            }
            const {idFornecedor, nome, preco, quantidade, dataVenc} = req.body;
            const imagem = `/uploads/imagens/${req.file.filename}`;
            const produto = Produtos.criar({ idFornecedor, nome, preco, quantidade, status: calcularStatus(quantidade, dataVenc), imagem, dataVenc });
            const result = await produtosRepository.criar(produto);

            res.status(201).json({ result });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Erro ao inserir produto",
                errorMessage: error.message
            });
        }
    },

    alterar: async (req, res) => {
        try {
            const id = req.params.id;

            const {
                idFornecedor, nome, preco, quantidade, dataVenc
            } = req.body;

            const imagem = req.file
                ? `/uploads/imagens/${req.file.filename}`
                : null;

            const status = calcularStatus(
                quantidade,
                dataVenc
            );

            const produto = Produtos.alterar({
                idFornecedor, nome, preco, quantidade, status, imagem, dataVenc
            }, id);

            const result = await produtosRepository.editar(produto);
            res.status(200).json({ message: 'Produto alterado com sucesso', result });
            console.log(result)

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Erro ao alterar produto",
                errorMessage: error.message
            });
        }
    },

    deletar: async (req, res) => {
        try {
            const id = req.params.id;

            await produtosRepository.deletar(id);
            res.status(200).json({ message: 'Produto deletado com sucesso' });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Erro ao deletar produto",
                errorMessage: error.message
            });
        }
    },
    selecionar: async (req, res) => {
        try {
            const result = await produtosRepository.selecionar();

            res.status(200).json({
                result
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Erro ao selecionar produtos",
                errorMessage: error.message
            });
        }
    },

    selecionarId: async (req, res) => {
        try {
            const id = req.params.id;

            const result = await produtosRepository.selecionarId(id);

            res.status(200).json({
                result
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Erro ao selecionar produto",
                errorMessage: error.message
            });
        }
    }

};

export default produtoController;