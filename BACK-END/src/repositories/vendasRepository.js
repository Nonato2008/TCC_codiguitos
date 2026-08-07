import { connection } from "../config/Database.js";

const vendasRepository = {

    criar: async (venda, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let valorTotal = 0;

            for (const item of itens) {
                const [produtoRows] = await conn.execute(
                    "SELECT Preco FROM Produtos WHERE Id = ?",
                    [item.idProduto]
                );

                if (!produtoRows || produtoRows.length === 0) {
                    throw new Error(`Produto ${item.idProduto} não encontrado.`);
                }

                const preco = produtoRows[0].Preco;
                item.valor = preco;
                valorTotal += preco * item.qtd;
            }

            const [vendaRows] = await conn.execute(
                `INSERT INTO Vendas (IdProprietario, IdVendedor, ValorTotal)
                 VALUES (?, ?, ?)`,
                [venda.idProprietario, venda.idVendedor, valorTotal]
            );

            const vendaId = vendaRows.insertId;

            for (const item of itens) {
                await conn.execute(
                    `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
                     VALUES (?, ?, ?, ?)`,
                    [vendaId, item.idProduto, item.qtd, item.valor]
                );
            }

            await conn.commit();

            return {
                id: vendaId,
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
                const [produtoRows] = await conn.execute(
                    "SELECT Preco FROM Produtos WHERE Id = ?",
                    [item.idProduto]
                );

                if (!produtoRows || produtoRows.length === 0) {
                    throw new Error(`Produto ${item.idProduto} não encontrado.`);
                }

                const preco = produtoRows[0].Preco;
                item.valor = preco;
                valorTotal += preco * item.qtd;
            }

            await conn.execute(
                `UPDATE Vendas
                 SET IdProprietario = ?,
                     IdVendedor = ?,
                     ValorTotal = ?
                 WHERE Id = ?`,
                [venda.idProprietario, venda.idVendedor, valorTotal, id]
            );

            await conn.execute(
                "DELETE FROM Itens_vendas WHERE IdVenda = ?",
                [id]
            );

            for (const item of itens) {
                await conn.execute(
                    `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
                     VALUES (?, ?, ?, ?)`,
                    [id, item.idProduto, item.qtd, item.valor]
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
        }
    },

    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                "DELETE FROM Itens_vendas WHERE IdVenda = ?",
                [id]
            );

            await conn.execute(
                "DELETE FROM Vendas WHERE Id = ?",
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

    removerItem: async (vendaId, itemId) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [itemRows] = await conn.execute(
                "SELECT * FROM Itens_vendas WHERE Id = ? AND IdVenda = ?",
                [itemId, vendaId]
            );

            if (!itemRows || itemRows.length === 0) {
                throw new Error("Item não encontrado na venda");
            }

            await conn.execute(
                "DELETE FROM Itens_vendas WHERE Id = ?",
                [itemId]
            );

            const [itens] = await conn.execute(
                "SELECT Qtd, Valor FROM Itens_vendas WHERE IdVenda = ?",
                [vendaId]
            );

            let valorTotal = 0;
            itens.forEach(i => {
                valorTotal += i.Qtd * i.Valor;
            });

            await conn.execute(
                "UPDATE Vendas SET ValorTotal = ? WHERE Id = ?",
                [valorTotal, vendaId]
            );

            await conn.commit();

            return { vendaId, itemId, valorTotal };

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
                v.*, 
                i.Id AS itemId, 
                i.IdProduto, 
                i.Qtd, 
                i.Valor
            FROM Vendas v
            LEFT JOIN Itens_vendas i ON i.IdVenda = v.Id
            ORDER BY v.Id DESC, i.Id ASC
        `);

        return rows;
    },

    selecionarId: async (id) => {
        const sql = `
            SELECT *
            FROM Vendas
            WHERE Id = ?
        `;

        const values = [id];
        const [rows] = await connection.execute(sql, values);

        return rows[0] ?? null;
    },

    adicionarItem: async (vendaId, item) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [produtoRows] = await conn.execute(
                "SELECT Preco FROM Produtos WHERE Id = ?",
                [item.produtoId]
            );

            if (!produtoRows || produtoRows.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const valor = produtoRows[0].Preco;

            const [result] = await conn.execute(
                `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
                 VALUES (?, ?, ?, ?)`,
                [vendaId, item.produtoId, item.quantidade, valor]
            );

            await conn.execute(
                `UPDATE Vendas 
                 SET ValorTotal = ValorTotal + ? 
                 WHERE Id = ?`,
                [valor * item.quantidade, vendaId]
            );

            await conn.commit();

            return { vendaId, itemId: result.insertId };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    editarItem: async (vendaId, itemId, quantidade) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            if (quantidade === undefined || quantidade <= 0) {
                throw new Error("Quantidade inválida");
            }

            const [itemRows] = await conn.execute(
                "SELECT * FROM Itens_vendas WHERE Id = ? AND IdVenda = ?",
                [itemId, vendaId]
            );

            if (!itemRows || itemRows.length === 0) {
                throw new Error("Item não encontrado na venda");
            }

            const valor = itemRows[0].Valor;

            await conn.execute(
                `UPDATE Itens_vendas 
                 SET Qtd = ?, Valor = ? 
                 WHERE Id = ?`,
                [quantidade, valor, itemId]
            );

            const [itens] = await conn.execute(
                "SELECT Qtd, Valor FROM Itens_vendas WHERE IdVenda = ?",
                [vendaId]
            );

            let valorTotal = 0;
            itens.forEach(i => {
                valorTotal += i.Qtd * i.Valor;
            });

            await conn.execute(
                "UPDATE Vendas SET ValorTotal = ? WHERE Id = ?",
                [valorTotal, vendaId]
            );

            await conn.commit();

            return { vendaId, itemId, valorTotal };

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

            const [vendaRows] = await conn.execute(
                "SELECT * FROM Vendas WHERE Id = ?",
                [id]
            );

            if (!vendaRows || vendaRows.length === 0) {
                throw new Error("Venda não encontrada");
            }

            await conn.execute(
                "UPDATE Vendas SET Status = ? WHERE Id = ?",
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
};

export default vendasRepository;
