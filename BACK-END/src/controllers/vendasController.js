import { statusPed } from "../enums/statusVenda.js";
import { ItensVendas } from "../models/ItensVendas.js";
import { Vendas } from "../models/Vendas.js";
import vendasRepository from "../repositories/vendasRepository.js";

const vendaController = {

    // Create - POST
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


            // Normaliza os nomes dos campos dos itens
            const itensVenda = itens.map(item => ({
       
                idVenda: Number(id),
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
                message: "Erro ao atualizar venda.",
                error: error.message
            });
        }
    },

    // Delete - DELETE_____________________________________________________________
    deletar: async (req, res) => {
       
        try {
       
            const { id } = req.params;

            if (!id || Number(id) <= 0) {
       
                return res.status(400).json({ message: "ID inválido" });
            }

            const result = await vendasRepository.deletar(Number(id));

            return res.status(200).json({
       
                message: "Venda deletada",
                data: result
            });

        } catch (error) {
       
            return res.status(500).json({
                message: "Erro ao deletar pedido",
                errorMessage: error.message
            });
        }
    },

    // Read - GET____________________________________________________________________
    selecionar: async (req, res) => {
       
        try {
       
            const result = await vendasRepository.selecionar();
            return res.status(200).json(result);
        } catch (error) {
       
            return res.status(500).json({
                message: "Erro ao buscar vendas",
                errorMessage: error.message
            });
        }
    },
// Read - GET by ID____________________________________________________________________
    selecionarId: async (req, res) => {
       
        try {
       
            const id = req.params.id;

            const result = await vendasRepository.selecionarId(id);
            return res.status(200).json(result);

        } catch (error) {
       
            return res.status(500).json({
                message: "Erro ao buscar pedido",
                errorMessage: error.message
            });
        }
    },
// create - POST____________________________________________________________________
    adicionarItem: async (req, res) => {
       
        try {
       
            const { id } = req.params;
            const { produtoId, quantidade } = req.body;

            if (!id || Number(id) <= 0) {
       
                return res.status(400).json({ message: "Venda inválida" });
            }

            if (!produtoId || !quantidade || quantidade <= 0) {
       
                return res.status(400).json({ message: "Dados do item inválidos" });
            }

            const item = ItensVendas.criar({ produtoId, quantidade });

            const result = await vendasRepository.adicionarItem(id, item);

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
// Update - PUT____________________________________________________________________
    editarItem: async (req, res) => {
       
        try {
       
            const { id, itemId } = req.params;
            const { quantidade } = req.body;

            if (!quantidade || quantidade <= 0) {
       
                return res.status(400).json({ message: "Quantidade inválida" });
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
// Delete - DELETE____________________________________________________________________
    removerItem: async (req, res) => {
       
        try {
       
            const { id, itemId } = req.params;

            if (!id || Number(id) <= 0) {
       
                return res.status(400).json({ message: "Venda inválida" });
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
    }
};

export default vendaController;