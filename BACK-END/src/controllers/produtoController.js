import { statusPed } from "../enums/statusVenda.js";
import { Produtos } from "../models/Produtos.js";
import produtosRepository from "../repositories/produtosRepository.js";

const produtoController = {
    inserir: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Imagem não foi enviada' });
            }
            const {idFornecedor, nome, preco, quantidade, status, dataVenc} = req.body;
            const imagem = `/uploads/imagens/${req.file.filename}`;
            const produto = Produtos.criar({ idFornecedor, nome, preco, quantidade, status:statusPed.ESTOQUE, imagem, dataVenc });
            const result = await produtosRepository.criar(produto);
            res.status(201).json({ result });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao inserir produto', errorMessage: error.message });
        }
    },
    alterar: async (req, res) => {
        try {
            const id = req.params.id;
            const { idFornecedor, nome, preco, quantidade, status, dataVenc } = req.body;
          
            const imagem = req.file ? `/uploads/imagens/${req.file.filename}` : null;
           const produto = Produtos.alterar({ idFornecedor, nome, preco, quantidade, status, imagem, dataVenc }, id);
            const result = await produtosRepository.editar(produto);
            res.status(200).json({ message: 'Produto alterado com sucesso', result });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao alterar produto', errorMessage: error.message });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            await produtosRepository.deletar(id);
            res.status(204).send();

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao deletar produto', errorMessage: error.message });
        }
    },
    selecionar: async (req, res) => {
        try {
            const result = await produtosRepository.selecionar();
            res.status(200).json({ result });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar produtos', errorMessage: error.message });
        }
    },

    selecionarId: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await produtosRepository.selecionarId(id);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar produtos', errorMessage: error.message });
        }
    }

}

export default produtoController;