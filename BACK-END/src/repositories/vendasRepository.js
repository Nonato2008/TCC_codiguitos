import { connection } from "../config/Database.js";

const vendasRepository = {

criar: async (venda, itens) => {
    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();
        let valorTotal = 0;
        for (const item of itens) {
            const [produtoRows] = await conn.execute(
                `SELECT Id, Preco, Quantidade, Status, DataVenc
                 FROM Produtos
                 WHERE Id = ?
                 FOR UPDATE`,
                [item.idProduto]
            );

            if (!produtoRows || produtoRows.length === 0) {
                throw new Error(`Produto ${item.idProduto} não encontrado.`);
            }

            const produto = produtoRows[0];
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const vencimento = new Date(produto.DataVenc);
            vencimento.setHours(0, 0, 0, 0);

            if (vencimento < hoje) {
                await conn.execute(
                    `UPDATE Produtos
                     SET Status = 'Vencido'
                     WHERE Id = ?`,
                    [item.idProduto]
                );

                throw new Error(`O produto ${item.idProduto} está vencido e não pode ser vendido.`);
            }

            if (produto.Quantidade <= 0 || produto.Status === 'Esgotado') {
                await conn.execute(
                    `UPDATE Produtos
                     SET Status = 'Esgotado'
                     WHERE Id = ?`,
                    [item.idProduto]
                );

                throw new Error(`O produto ${item.idProduto} está esgotado e não pode ser vendido.`);
            }

            if (Number(item.qtd) > Number(produto.Quantidade)) {
                throw new Error(
                    `Estoque insuficiente para o produto ${item.idProduto}. Estoque disponível: ${produto.Quantidade}.`
                );
            }

            const preco = produto.Preco;
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

            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade - ?,
                     Status = CASE
                         WHEN Quantidade - ? <= 0 THEN 'Esgotado'
                         ELSE 'Em Estoque'
                     END
                 WHERE Id = ?`,
                [item.qtd, item.qtd, item.idProduto]
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

        const [itensAntigos] = await conn.execute(
            `SELECT IdProduto, Qtd
             FROM Itens_vendas
             WHERE IdVenda = ?`,
            [id]
        );

        for (const item of itensAntigos) {
            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade + ?,
                     Status = CASE
                         WHEN Quantidade + ? > 0 THEN 'Em Estoque'
                         ELSE 'Esgotado'
                     END
                 WHERE Id = ?`,
                [item.Qtd, item.Qtd, item.IdProduto]
            );
        }

        let valorTotal = 0;
        for (const item of itens) {
            const [produtoRows] = await conn.execute(
                `SELECT Id, Preco, Quantidade, Status, DataVenc
                 FROM Produtos
                 WHERE Id = ?
                 FOR UPDATE`,
                [item.idProduto]
            );

            if (!produtoRows || produtoRows.length === 0) {
                throw new Error(`Produto ${item.idProduto} não encontrado.`);
            }

            const produto = produtoRows[0];
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencimento = new Date(produto.DataVenc);
            vencimento.setHours(0, 0, 0, 0);

            if (vencimento < hoje) {
                await conn.execute(
                    `UPDATE Produtos
                     SET Status = 'Vencido'
                     WHERE Id = ?`,
                    [item.idProduto]
                );

                throw new Error(`O produto ${item.idProduto} está vencido e não pode ser vendido.`);
            }

            if (produto.Quantidade <= 0 || produto.Status === 'Esgotado') {
                await conn.execute(
                    `UPDATE Produtos
                     SET Status = 'Esgotado'
                     WHERE Id = ?`,
                    [item.idProduto]
                );

                throw new Error(`O produto ${item.idProduto} está esgotado e não pode ser vendido.`);
            }

            if (Number(item.qtd) > Number(produto.Quantidade)) {
                throw new Error(
                    `Estoque insuficiente para o produto ${item.idProduto}. Estoque disponível: ${produto.Quantidade}.`
                );
            }

            const preco = produto.Preco;
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

            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade - ?,
                     Status = CASE
                         WHEN Quantidade - ? <= 0 THEN 'Esgotado'
                         ELSE 'Em Estoque'
                     END
                 WHERE Id = ?`,
                [item.qtd, item.qtd, item.idProduto]
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
        const [itens] = await conn.execute(
            `SELECT IdProduto, Qtd
             FROM Itens_vendas
             WHERE IdVenda = ?`,
            [id]
        );

        for (const item of itens) {
            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade + ?,
                     Status = CASE
                         WHEN Quantidade + ? > 0 THEN 'Em Estoque'
                         ELSE 'Esgotado'
                     END
                 WHERE Id = ?`,
                [item.Qtd, item.Qtd, item.IdProduto]
            );
        }

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

        const item = itemRows[0];
        await conn.execute(
            `UPDATE Produtos
             SET Quantidade = Quantidade + ?,
                 Status = CASE
                     WHEN Quantidade + ? > 0 THEN 'Em Estoque'
                     ELSE 'Esgotado'
                 END
             WHERE Id = ?`,
            [item.Qtd, item.Qtd, item.IdProduto]
        );

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
            `SELECT Id, Preco, Quantidade, Status, DataVenc
             FROM Produtos
             WHERE Id = ?
             FOR UPDATE`,
            [item.produtoId]
        );

        if (!produtoRows || produtoRows.length === 0) {
            throw new Error("Produto não encontrado");
        }

        const produto = produtoRows[0];
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const vencimento = new Date(produto.DataVenc);
        vencimento.setHours(0, 0, 0, 0);

        if (vencimento < hoje) {
            await conn.execute(
                `UPDATE Produtos
                 SET Status = 'Vencido'
                 WHERE Id = ?`,
                [item.produtoId]
            );

            throw new Error("Produto vencido e não pode ser vendido.");
        }

        if (produto.Quantidade <= 0 || produto.Status === 'Esgotado') {
            await conn.execute(
                `UPDATE Produtos
                 SET Status = 'Esgotado'
                 WHERE Id = ?`,
                [item.produtoId]
            );

            throw new Error("Produto esgotado e não pode ser vendido.");
        }

        if (Number(item.quantidade) > Number(produto.Quantidade)) {
            throw new Error(
                `Estoque insuficiente. Disponível: ${produto.Quantidade}.`
            );
        }

        const valor = produto.Preco;
        const [result] = await conn.execute(
            `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
             VALUES (?, ?, ?, ?)`,
            [vendaId, item.produtoId, item.quantidade, valor]
        );

        await conn.execute(
            `UPDATE Produtos
             SET Quantidade = Quantidade - ?,
                 Status = CASE
                     WHEN Quantidade - ? <= 0 THEN 'Esgotado'
                     ELSE 'Em Estoque'
                 END
             WHERE Id = ?`,
            [item.quantidade, item.quantidade, item.produtoId]
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

        const itemAtual = itemRows[0];
        const [produtoRows] = await conn.execute(
            `SELECT Id, Quantidade, Status, DataVenc
             FROM Produtos
             WHERE Id = ?
             FOR UPDATE`,
            [itemAtual.IdProduto]
        );

        if (!produtoRows || produtoRows.length === 0) {
            throw new Error("Produto não encontrado");
        }

        const produto = produtoRows[0];
        await conn.execute(
            `UPDATE Produtos
             SET Quantidade = Quantidade + ?
             WHERE Id = ?`,
            [itemAtual.Qtd, itemAtual.IdProduto]
        );

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const vencimento = new Date(produto.DataVenc);
        vencimento.setHours(0, 0, 0, 0);

        if (vencimento < hoje) {
            await conn.execute(
                `UPDATE Produtos
                 SET Status = 'Vencido'
                 WHERE Id = ?`,
                [itemAtual.IdProduto]
            );

            throw new Error("Produto vencido e não pode ser vendido.");
        }

        const [estoqueRows] = await conn.execute(
            `SELECT Quantidade
             FROM Produtos
             WHERE Id = ?
             FOR UPDATE`,
            [itemAtual.IdProduto]
        );

        const estoqueDisponivel = Number(estoqueRows[0].Quantidade);
        if (Number(quantidade) > estoqueDisponivel) {
            throw new Error(
                `Estoque insuficiente. Disponível: ${estoqueDisponivel}.`
            );
        }

        await conn.execute(
            `UPDATE Itens_vendas 
             SET Qtd = ?
             WHERE Id = ?`,
            [quantidade, itemId]
        );

        await conn.execute(
            `UPDATE Produtos
             SET Quantidade = Quantidade - ?,
                 Status = CASE
                     WHEN Quantidade - ? <= 0 THEN 'Esgotado'
                     ELSE 'Em Estoque'
                 END
             WHERE Id = ?`,
            [quantidade, quantidade, itemAtual.IdProduto]
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