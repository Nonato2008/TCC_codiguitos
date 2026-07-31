import vendasRepository from "../repositories/vendasRepository.js";
import { statusPed } from "../enums/statusVenda.js";

const vendasController = {

    criar: async (req, res) => {
        try {
            const { idProprietario, idVendedor, itens } = req.body;

            if (!idProprietario || Number(idProprietario) <= 0) {
                return res.status(400).json({
                    message: "Id do propriet�rio inv�lido."
                });
            }

            if (!idVendedor || Number(idVendedor) <= 0) {
                return res.status(400).json({
                    message: "Id do vendedor inv�lido."
                });
            }

            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    message: "Informe os itens da venda."
                });
            }

            const itensVenda = itens.map(item => ({
                idProduto: item.idProduto ?? item.produtoId,
                qtd: item.qtd ?? item.quantidade,
                valor: 0
            }));

            const venda = {
                idProprietario,
                idVendedor
            };

            const resultado = await vendasRepository.criar(venda, itensVenda);

            return res.status(201).json(resultado);

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao criar venda.",
                error: error.message
            });
        }
    },

    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const { idProprietario, idVendedor, itens } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({
                    message: "Id inv�lido."
                });
            }

            if (!idProprietario || Number(idProprietario) <= 0) {
                return res.status(400).json({
                    message: "Id do propriet�rio inv�lido."
                });
            }

            if (!idVendedor || Number(idVendedor) <= 0) {
                return res.status(400).json({
                    message: "Id do vendedor inv�lido."
                });
            }

            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    message: "Informe os itens da venda."
                });
            }

            const itensVenda = itens.map(item => ({
                idVenda: Number(id),
                idProduto: item.idProduto ?? item.produtoId,
                qtd: item.qtd ?? item.quantidade,
                valor: 0
            }));

            const venda = {
                idProprietario,
                idVendedor
            };

            const resultado = await vendasRepository.editar(id, venda, itensVenda);

            return res.status(200).json({
                message: "Venda atualizada com sucesso.",
                data: resultado
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao editar venda.",
                error: error.message
            });
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inv�lido" });
            }

            const result = await vendasRepository.deletar(Number(id));

            return res.status(200).json({
                message: "Pedido deletado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao deletar pedido",
                errorMessage: error.message
            });
        }
    },

    selecionar: async (req, res) => {
        try {
            const result = await vendasRepository.selecionar();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                message: "Erro ao buscar pedidos",
                errorMessage: error.message
            });
        }
    },

    selecionarId: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inv�lido" });
            }

            const result = await vendasRepository.selecionarId(Number(id));
            return res.status(200).json(result);

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao buscar pedido",
                errorMessage: error.message
            });
        }
    },

    adicionarItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { produtoId, quantidade } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inv�lido" });
            }

            if (!produtoId || !quantidade || quantidade <= 0) {
                return res.status(400).json({ message: "Dados do item inv�lidos" });
            }

            const item = {
                idVenda: Number(id),
                idProduto: produtoId,
                produtoId,
                qtd: quantidade,
                quantidade,
                valor: 0
            };

            const result = await vendasRepository.adicionarItem(Number(id), item);

            return res.status(200).json({
                message: "Item adicionado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao adicionar item",
                errorMessage: error.message
            });
        }
    },

    editarItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;
            const { quantidade } = req.body;

            if (!quantidade || quantidade <= 0) {
                return res.status(400).json({ message: "Quantidade inv�lida" });
            }

            const result = await vendasRepository.editarItem(
                Number(id),
                Number(itemId),
                quantidade
            );

            return res.status(200).json({
                message: "Item atualizado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao editar item",
                errorMessage: error.message
            });
        }
    },

    removerItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inv�lido" });
            }

            if (!itemId || Number(itemId) <= 0) {
                return res.status(400).json({ message: "Item inv�lido" });
            }

            const result = await vendasRepository.removerItem(
                Number(id),
                Number(itemId)
            );

            return res.status(200).json({
                message: "Item removido",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao remover item",
                errorMessage: error.message
            });
        }
    },

    editarStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inv�lido" });
            }

            if (!Object.values(statusPed).includes(status)) {
                return res.status(400).json({ message: "Status inv�lido" });
            }

            const result = await vendasRepository.editarStatus(
                Number(id),
                status
            );

            return res.status(200).json({
                message: "Status atualizado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao atualizar status",
                errorMessage: error.message
            });
        }
    }
};

export default vendasController;
