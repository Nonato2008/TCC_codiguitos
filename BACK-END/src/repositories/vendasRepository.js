import { connection } from "../config/Database.js";

const vendasRepository = {

    criar: async (venda, itens) => {
        const conn = await connection.getConnection();

        try {

            await conn.beginTransaction();

            let valorTotal = 0;

            // Calcula o valor total da venda
            for (const item of itens) {

                const [produto] = await conn.execute(
                    "SELECT Preco FROM Produtos WHERE Id = ?",
                    [item.idProduto]
                );

                if (produto.length === 0) {
                    throw new Error(`Produto ${item.idProduto} não encontrado.`);
                }

                const preco = produto[0].Preco;

                item.valor = preco;

                valorTotal += preco * item.qtd;
            }

            // Insere a venda
            const [vendaRows] = await conn.execute(
                `INSERT INTO Vendas
                (IdProprietario, IdVendedor, ValorTotal)
                VALUES (?, ?, ?)`,
                [
                    venda.idProprietario,
                    venda.idVendedor,
                    valorTotal
                ]
            );

            // Insere os itens
            for (const item of itens) {

                await conn.execute(
                    `INSERT INTO Itens_vendas
                    (IdVenda, IdProduto, Qtd, Valor)
                    VALUES (?, ?, ?, ?)`,
                    [
                        vendaRows.insertId,
                        item.idProduto,
                        item.qtd,
                        item.valor
                    ]
                );

            }

            await conn.commit();

            return {
                id: vendaRows.insertId,
                valorTotal
            };

        } catch (error) {

            await conn.rollback();
            throw error;

        } finally {

            conn.release();

        }
    },

    editar: async (id, venda, itens) => {

        const conn = await connection.getConnection();

        try {

            await conn.beginTransaction();

            let valorTotal = 0;

            for (const item of itens) {

                const [produto] = await conn.execute(
                    "SELECT Preco FROM Produtos WHERE Id = ?",
                    [item.idProduto]
                );

                if (produto.length === 0) {
                    throw new Error(`Produto ${item.idProduto} não encontrado.`);
                }

                const preco = produto[0].Preco;

                item.valor = preco;

                valorTotal += preco * item.qtd;
            }

            await conn.execute(
                `UPDATE Vendas
                SET IdProprietario = ?,
                    IdVendedor = ?,
                    ValorTotal = ?
                WHERE Id = ?`,
                [
                    venda.idProprietario,
                    venda.idVendedor,
                    valorTotal,
                    id
                ]
            );

            // Remove os itens antigos
            await conn.execute(
                "DELETE FROM Itens_vendas WHERE IdVenda = ?",
                [id]
            );

            // Insere novamente
            for (const item of itens) {

                await conn.execute(
                    `INSERT INTO Itens_vendas
                    (IdVenda, IdProduto, Qtd, Valor)
                    VALUES (?, ?, ?, ?)`,
                    [
                        id,
                        item.idProduto,
                        item.qtd,
                        item.valor
                    ]
                );

            }

            await conn.commit();

            return {
                id,
                valorTotal
            };

        } catch (error) {

            await conn.rollback();
            throw error;

        } finally {

            conn.release();

        }},

    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                "DELETE FROM itens_pedidos WHERE pedidoId = ?",
                [id]
            );

            await conn.execute(
                "DELETE FROM pedidos WHERE id = ?",
                [id]
            );

            await conn.commit();
            return { id };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },
    removerItem: async (pedidoId, itemId) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [item] = await conn.execute(
                "SELECT * FROM itens_pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            await conn.execute(
                "DELETE FROM itens_pedidos WHERE id = ?",
                [itemId]
            );

            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let subTotal = 0;

            itens.forEach(i => {
                subTotal += i.Quatidade * i.valorItem;
            });

            await conn.execute(
                "UPDATE pedidos SET valorTotal = ? WHERE id = ?",
                [subTotal, pedidoId]
            );

            await conn.commit();

            return { pedidoId, itemId, subTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionar: async () => {
        const [rows] = await connection.execute(`
            SELECT 
                p.*,
                i.id as itemId,
                i.produtoId,
                i.quantidade,
                i.valorItem
            FROM pedidos p
            LEFT JOIN itens_pedidos i ON i.pedidoId = p.id
            ORDER BY p.id DESC, i.id ASC
        `);

        return rows;
    },

    adicionarItem: async (pedidoId, item) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [produto] = await conn.execute(
                "SELECT preco FROM produtos WHERE id = ?",
                [item.produtoId]
            );

            if (produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const valor = produto[0].Valor;

            await conn.execute(
                `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
             VALUES (?, ?, ?, ?)`,
                [pedidoId, item.produtoId, item.quantidade, valor]
            );

            await conn.execute(
                `UPDATE pedidos 
             SET valorTotal = valorTotal + ? 
             WHERE id = ?`,
                [valor * item.quantidade, pedidoId]
            );

            await conn.commit();

            return { pedidoId };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    editarItem: async (pedidoId, itemId, quantidade) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            if (quantidade === undefined || quantidade <= 0) {
                throw new Error("Quantidade inválida");
            }

            const [item] = await conn.execute(
                "SELECT * FROM itens_pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            const [produto] = await conn.execute(
                "SELECT preco FROM produtos WHERE idProduto = ?",
                [item[0].ProdutoId]
            );

            if (!produto || produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const valor = produto[0].Valor;

            await conn.execute(
                `UPDATE itens_pedidos 
             SET quantidade = ?, valorItem = ? 
             WHERE id = ?`,
                [quantidade, valor, itemId]
            );

            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let subTotal = 0;

            itens.forEach(i => {
                subTotal += i.Quatidade * i.valorItem;
            });

            await conn.execute(
                "UPDATE pedidos SET valorTotal = ? WHERE id = ?",
                [subTotal, pedidoId]
            );

            await conn.commit();

            return { pedidoId, itemId, subTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    editarStatus: async (id, status) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            if (!status) {
                throw new Error("Status inválido");
            }

            const [pedido] = await conn.execute(
                "SELECT * FROM pedidos WHERE id = ?",
                [id]
            );

            if (pedido.length === 0) {
                throw new Error("Pedido não encontrado");
            }

            await conn.execute(
                "UPDATE pedidos SET Status = ? WHERE id = ?",
                [status, id]
            );

            await conn.commit();

            return { id, status };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

export default vendasRepository;