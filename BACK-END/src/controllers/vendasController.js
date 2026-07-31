import { Vendas } from "../models/Vendas.js";
// import { Vendas } from "../models/ItensVendas.js";
import pedidoRepository from "../repositories/vendasRepository.js";

const vendasController = {

    criar: async (req, res) => {
        try {
            const { idProprietario, idVendedor, itens } = req.body;

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

            const itensVenda = itens.map(item =>
                ItensVendas.criar({
                    idVenda: null,
                    idProduto: item.idProduto,
                    qtd: item.qtd,
                    valor: 0
                })
            );

            const venda = Vendas.criar({
                idProprietario,
                idVendedor,
                valorTotal: 0
            });

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

            const itensVenda = itens.map(item =>
                ItensVendas.alterar({
                    idVenda: id,
                    idProduto: item.idProduto,
                    qtd: item.qtd,
                    valor: 0
                })
            );

            const venda = Vendas.alterar({
                idProprietario,
                idVendedor,
                valorTotal: 0
            }, id);

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
                return res.status(400).json({ message: "ID inválido" });
            }

            const result = await pedidoRepository.deletar(Number(id));

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
            const result = await pedidoRepository.selecionar();
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
            const  id  = req.params; 

            const result = await pedidoRepository.selecionarId(Number(id));
            return res.status(200).json(result);

        }catch (error) {
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
                    return res.status(400).json({ message: "Pedido inválido" });
                }

                if (!produtoId || !quantidade || quantidade <= 0) {
                    return res.status(400).json({ message: "Dados do item inválidos" });
                }

                const item = ItensPedido.criar({ produtoId, quantidade });

                const result = await pedidoRepository.adicionarItem(id, item);

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
                        return res.status(400).json({ message: "Quantidade inválida" });
                    }

                    const result = await pedidoRepository.editarItem(
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
                            return res.status(400).json({ message: "Pedido inválido" });
                        }

                        if (!itemId || Number(itemId) <= 0) {
                            return res.status(400).json({ message: "Item inválido" });
                        }

                        const result = await pedidoRepository.removerItem(
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
                                return res.status(400).json({ message: "ID inválido" });
                            }

                            if (!Object.values(statusPed).includes(status)) {
                                return res.status(400).json({ message: "Status inválido" });
                            }

                            const result = await pedidoRepository.editarStatus(
                                Number(id),
                                status
                            );

<<<<<<< HEAD
export default vendasController;
=======
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

    export default pedidoController;
>>>>>>> 6bf6865bba0d29dfd7daa06123be94080e2b51a5
