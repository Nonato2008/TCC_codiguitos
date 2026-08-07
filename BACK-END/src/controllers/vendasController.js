import vendasRepository from "../repositories/vendasRepository.js";
import { statusPed } from "../enums/statusVenda.js";

const vendasController = {

    // Cria uma nova venda
    criar: async (req, res) => {
        try {
            const { idProprietario, idVendedor, itens } = req.body;

            // Valida o id do proprietário
            if (!idProprietario || Number(idProprietario) <= 0) {
                return res.status(400).json({
                    message: "Id do proprietário inválido."
                });
            }

            // Valida o id do vendedor
            if (!idVendedor || Number(idVendedor) <= 0) {
                return res.status(400).json({
                    message: "Id do vendedor inválido."
                });
            }

            // Valida se foram enviados itens
            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    message: "Informe os itens da venda."
                });
            }

            // Normaliza os nomes dos campos dos itens
            const itensVenda = itens.map(item => ({
                idProduto: item.idProduto ?? item.produtoId,
                qtd: item.qtd ?? item.quantidade
            }));

            // Valida cada item
            for (const item of itensVenda) {
                if (!item.idProduto || Number(item.idProduto) <= 0) {
                    return res.status(400).json({ message: "Id do produto inválido." });
                }
                if (!item.qtd || Number(item.qtd) <= 0) {
                    return res.status(400).json({ message: "Quantidade inválida." });
                }
            }

            const venda = {
                idProprietario: Number(idProprietario),
                idVendedor: Number(idVendedor)
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

    // Edita uma venda completa
    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const { idProprietario, idVendedor, itens } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({
                    message: "Id inválido."
                });
            }

            if (!idProprietario || Number(idProprietario) <= 0) {
                return res.status(400).json({
                    message: "Id do proprietário inválido."
                });
            }

            if (!idVendedor || Number(idVendedor) <= 0) {
                return res.status(400).json({
                    message: "Id do vendedor inválido."
                });
            }

            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({
                    message: "Informe os itens da venda."
                });
            }

            // Normaliza os nomes dos campos dos itens
            const itensVenda = itens.map(item => ({
                idProduto: item.idProduto ?? item.produtoId,
                qtd: item.qtd ?? item.quantidade
            }));

            for (const item of itensVenda) {
                if (!item.idProduto || Number(item.idProduto) <= 0) {
                    return res.status(400).json({ message: "Id do produto inválido." });
                }
                if (!item.qtd || Number(item.qtd) <= 0) {
                    return res.status(400).json({ message: "Quantidade inválida." });
                }
            }

            const venda = {
                idProprietario: Number(idProprietario),
                idVendedor: Number(idVendedor)
            };

            const resultado = await vendasRepository.editar(Number(id), venda, itensVenda);

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

    // Deleta uma venda
    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inválido" });
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

    // Lista todas as vendas
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

    // Busca uma venda pelo ID
    selecionarId: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inválido" });
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

    // Adiciona um item em uma venda existente
    adicionarItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { produtoId, quantidade, idProduto, qtd } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inválido" });
            }

            // Aceita tanto produtoId/quantidade quanto idProduto/qtd
            const produto = produtoId ?? idProduto;
            const qtde = quantidade ?? qtd;

            if (!produto || Number(produto) <= 0 || !qtde || Number(qtde) <= 0) {
                return res.status(400).json({ message: "Dados do item inválidos" });
            }

            const item = {
                idProduto: Number(produto),
                qtd: Number(qtde)
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

    // Altera a quantidade de um item
    editarItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;
            const { quantidade } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inválido" });
            }

            if (!itemId || Number(itemId) <= 0) {
                return res.status(400).json({ message: "Item inválido" });
            }

            if (!quantidade || Number(quantidade) <= 0) {
                return res.status(400).json({ message: "Quantidade inválida" });
            }

            const result = await vendasRepository.editarItem(
                Number(id),
                Number(itemId),
                Number(quantidade)
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

    // Remove um item da venda
    removerItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inválido" });
            }

            if (!itemId || Number(itemId) <= 0) {
                return res.status(400).json({ message: "Item inválido" });
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

    // Altera o status da venda
    editarStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inválido" });
            }

            if (!Object.values(statusPed).includes(status)) {
                return res.status(400).json({ message: "Status inválido" });
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