import { connection } from "../config/Database.js";

const vendasRepository = {

    criar: async (venda, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let valorTotal = 0;

            if (!Array.isArray(itens) || itens.length === 0) {
                throw new Error("A venda deve possuir pelo menos um item.");
            }

            for (const item of itens) {

                if (!item.idProduto || !item.qtd || Number(item.qtd) <= 0) {
                    throw new Error("Produto ou quantidade inválida.");
                }

                const [produtoRows] = await conn.execute(
                    `SELECT Id, Preco, Quantidade, Status, DataVenc
                     FROM Produtos
                     WHERE Id = ?
                     FOR UPDATE`,
                    [item.idProduto]
                );

                if (produtoRows.length === 0) {
                    throw new Error(
                        `Produto ${item.idProduto} não encontrado.`
                    );
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

                    throw new Error(
                        `O produto ${item.idProduto} está vencido e não pode ser vendido.`
                    );
                }

                if (Number(produto.Quantidade) <= 0) {
                    await conn.execute(
                        `UPDATE Produtos
                         SET Status = 'Esgotado'
                         WHERE Id = ?`,
                        [item.idProduto]
                    );

                    throw new Error(
                        `O produto ${item.idProduto} está esgotado.`
                    );
                }

                if (Number(item.qtd) > Number(produto.Quantidade)) {
                    throw new Error(
                        `Estoque insuficiente para o produto ${item.idProduto}. Disponível: ${produto.Quantidade}.`
                    );
                }

                const preco = Number(produto.Preco);

                item.valor = preco;
                valorTotal += preco * Number(item.qtd);
            }

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

            const vendaId = vendaRows.insertId;

            for (const item of itens) {

                await conn.execute(
                    `INSERT INTO Itens_vendas
                        (IdVenda, IdProduto, Qtd, Valor)
                     VALUES (?, ?, ?, ?)`,
                    [
                        vendaId,
                        item.idProduto,
                        item.qtd,
                        item.valor
                    ]
                );

                const [alterarResultado] = await conn.execute(
                    `UPDATE Produtos
                     SET Quantidade = Quantidade - ?,
                         Status = CASE
                             WHEN Quantidade - ? <= 0
                                 THEN 'Esgotado'
                             ELSE 'Em Estoque'
                         END
                     WHERE Id = ?
                       AND Quantidade >= ?`,
                    [
                        item.qtd,
                        item.qtd,
                        item.idProduto,
                        item.qtd
                    ]
                );

                if (alterarResultado.affectedRows === 0) {
                    throw new Error(
                        `Falha ao atualizar estoque do produto ${item.idProduto}.`
                    );
                }
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

            if (!Array.isArray(itens) || itens.length === 0) {
                throw new Error("A venda deve possuir pelo menos um item.");
            }

            const [itensAntigos] = await conn.execute(
                `SELECT IdProduto, Qtd
                 FROM Itens_vendas
                 WHERE IdVenda = ?
                 FOR UPDATE`,
                [id]
            );

            for (const item of itensAntigos) {
                await conn.execute(
                    `UPDATE Produtos
                     SET Quantidade = Quantidade + ?,
                         Status = CASE
                             WHEN DataVenc < CURDATE()
                                 THEN 'Vencido'
                             ELSE 'Em Estoque'
                         END
                     WHERE Id = ?`,
                    [
                        item.Qtd,
                        item.IdProduto
                    ]
                );
            }

            let valorTotal = 0;

            for (const item of itens) {

                if (!item.idProduto || !item.qtd || Number(item.qtd) <= 0) {
                    throw new Error("Produto ou quantidade inválida.");
                }

                const [produtoRows] = await conn.execute(
                    `SELECT Id, Preco, Quantidade, Status, DataVenc
                     FROM Produtos
                     WHERE Id = ?
                     FOR UPDATE`,
                    [item.idProduto]
                );

                if (produtoRows.length === 0) {
                    throw new Error(
                        `Produto ${item.idProduto} não encontrado.`
                    );
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

                    throw new Error(
                        `O produto ${item.idProduto} está vencido e não pode ser vendido.`
                    );
                }

                if (Number(produto.Quantidade) <= 0) {
                    await conn.execute(
                        `UPDATE Produtos
                         SET Status = 'Esgotado'
                         WHERE Id = ?`,
                        [item.idProduto]
                    );

                    throw new Error(
                        `O produto ${item.idProduto} está esgotado.`
                    );
                }

                if (Number(item.qtd) > Number(produto.Quantidade)) {
                    throw new Error(
                        `Estoque insuficiente para o produto ${item.idProduto}. Disponível: ${produto.Quantidade}.`
                    );
                }

                const preco = Number(produto.Preco);

                item.valor = preco;
                valorTotal += preco * Number(item.qtd);
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

            await conn.execute(
                `DELETE FROM Itens_vendas
                 WHERE IdVenda = ?`,
                [id]
            );

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

                const [resultado] = await conn.execute(
                    `UPDATE Produtos
                     SET Quantidade = Quantidade - ?,
                         Status = CASE
                             WHEN Quantidade - ? <= 0
                                 THEN 'Esgotado'
                             WHEN DataVenc < CURDATE()
                                 THEN 'Vencido'
                             ELSE 'Em Estoque'
                         END
                     WHERE Id = ?
                       AND Quantidade >= ?`,
                    [
                        item.qtd,
                        item.qtd,
                        item.idProduto,
                        item.qtd
                    ]
                );

                if (resultado.affectedRows === 0) {
                    throw new Error(
                        `Falha ao atualizar estoque do produto ${item.idProduto}.`
                    );
                }
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
                 WHERE IdVenda = ?
                 FOR UPDATE`,
                [id]
            );

            for (const item of itens) {
                await conn.execute(
                    `UPDATE Produtos
                     SET Quantidade = Quantidade + ?,
                         Status = CASE
                             WHEN DataVenc < CURDATE()
                                 THEN 'Vencido'
                             ELSE 'Em Estoque'
                         END
                     WHERE Id = ?`,
                    [
                        item.Qtd,
                        item.IdProduto
                    ]
                );
            }

            await conn.execute(
                `DELETE FROM Itens_vendas
                 WHERE IdVenda = ?`,
                [id]
            );

            await conn.execute(
                `DELETE FROM Vendas
                 WHERE Id = ?`,
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
                `SELECT *
                 FROM Itens_vendas
                 WHERE Id = ?
                   AND IdVenda = ?
                 FOR UPDATE`,
                [
                    itemId,
                    vendaId
                ]
            );

            if (itemRows.length === 0) {
                throw new Error("Item não encontrado na venda.");
            }

            const item = itemRows[0];

            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade + ?,
                     Status = CASE
                         WHEN DataVenc < CURDATE()
                             THEN 'Vencido'
                         ELSE 'Em Estoque'
                     END
                 WHERE Id = ?`,
                [
                    item.Qtd,
                    item.IdProduto
                ]
            );

            await conn.execute(
                `DELETE FROM Itens_vendas
                 WHERE Id = ?`,
                [itemId]
            );

            const [itens] = await conn.execute(
                `SELECT Qtd, Valor
                 FROM Itens_vendas
                 WHERE IdVenda = ?`,
                [vendaId]
            );

            let valorTotal = 0;

            for (const itemVenda of itens) {
                valorTotal +=
                    Number(itemVenda.Qtd) *
                    Number(itemVenda.Valor);
            }

            await conn.execute(
                `UPDATE Vendas
                 SET ValorTotal = ?
                 WHERE Id = ?`,
                [
                    valorTotal,
                    vendaId
                ]
            );

            await conn.commit();

            return {
                vendaId,
                itemId,
                valorTotal
            };

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
            LEFT JOIN Itens_vendas i
                ON i.IdVenda = v.Id
            ORDER BY v.Id DESC, i.Id ASC
        `);

        return rows;
    },

    selecionarId: async (id) => {

        const [rows] = await connection.execute(
            `SELECT *
             FROM Vendas
             WHERE Id = ?`,
            [id]
        );

        return rows[0] ?? null;
    },

    adicionarItem: async (vendaId, item) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const produtoId = item.produtoId ?? item.idProduto;
            const quantidade = Number(
                item.quantidade ?? item.qtd
            );

            if (!produtoId || !quantidade || quantidade <= 0) {
                throw new Error("Produto ou quantidade inválida.");
            }

            const [produtoRows] = await conn.execute(
                `SELECT Id, Preco, Quantidade, Status, DataVenc
                 FROM Produtos
                 WHERE Id = ?
                 FOR UPDATE`,
                [produtoId]
            );

            if (produtoRows.length === 0) {
                throw new Error("Produto não encontrado.");
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
                    [produtoId]
                );

                throw new Error(
                    "Produto vencido e não pode ser vendido."
                );
            }

            if (Number(produto.Quantidade) <= 0) {

                await conn.execute(
                    `UPDATE Produtos
                     SET Status = 'Esgotado'
                     WHERE Id = ?`,
                    [produtoId]
                );

                throw new Error(
                    "Produto esgotado e não pode ser vendido."
                );
            }

            if (quantidade > Number(produto.Quantidade)) {
                throw new Error(
                    `Estoque insuficiente. Disponível: ${produto.Quantidade}.`
                );
            }

            const valor = Number(produto.Preco);

            const [result] = await conn.execute(
                `INSERT INTO Itens_vendas
                    (IdVenda, IdProduto, Qtd, Valor)
                 VALUES (?, ?, ?, ?)`,
                [
                    vendaId,
                    produtoId,
                    quantidade,
                    valor
                ]
            );

            const [alterarResultado] = await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade - ?,
                     Status = CASE
                         WHEN Quantidade - ? <= 0
                             THEN 'Esgotado'
                         ELSE 'Em Estoque'
                     END
                 WHERE Id = ?
                   AND Quantidade >= ?`,
                [
                    quantidade,
                    quantidade,
                    produtoId,
                    quantidade
                ]
            );

            if (alterarResultado.affectedRows === 0) {
                throw new Error(
                    "Falha ao atualizar estoque do produto."
                );
            }

            await conn.execute(
                `UPDATE Vendas
                 SET ValorTotal = ValorTotal + ?
                 WHERE Id = ?`,
                [
                    valor * quantidade,
                    vendaId
                ]
            );

            await conn.commit();

            return {
                vendaId,
                itemId: result.insertId
            };

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

            quantidade = Number(quantidade);

            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                throw new Error("Quantidade inválida.");
            }

            const [itemRows] = await conn.execute(
                `SELECT *
                 FROM Itens_vendas
                 WHERE Id = ?
                   AND IdVenda = ?
                 FOR UPDATE`,
                [
                    itemId,
                    vendaId
                ]
            );

            if (itemRows.length === 0) {
                throw new Error(
                    "Item não encontrado na venda."
                );
            }

            const itemAtual = itemRows[0];

            const [produtoRows] = await conn.execute(
                `SELECT Id, Preco, Quantidade, Status, DataVenc
                 FROM Produtos
                 WHERE Id = ?
                 FOR UPDATE`,
                [itemAtual.IdProduto]
            );

            if (produtoRows.length === 0) {
                throw new Error("Produto não encontrado.");
            }

            const produto = produtoRows[0];

            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade + ?
                 WHERE Id = ?`,
                [
                    itemAtual.Qtd,
                    itemAtual.IdProduto
                ]
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

                throw new Error(
                    "Produto vencido e não pode ser vendido."
                );
            }

            const [estoqueRows] = await conn.execute(
                `SELECT Quantidade
                 FROM Produtos
                 WHERE Id = ?
                 FOR UPDATE`,
                [itemAtual.IdProduto]
            );

            const estoqueDisponivel =
                Number(estoqueRows[0].Quantidade);

            if (quantidade > estoqueDisponivel) {
                throw new Error(
                    `Estoque insuficiente. Disponível: ${estoqueDisponivel}.`
                );
            }

            await conn.execute(
                `UPDATE Itens_vendas
                 SET Qtd = ?
                 WHERE Id = ?`,
                [
                    quantidade,
                    itemId
                ]
            );

            await conn.execute(
                `UPDATE Produtos
                 SET Quantidade = Quantidade - ?,
                     Status = CASE
                         WHEN Quantidade - ? <= 0
                             THEN 'Esgotado'
                         ELSE 'Em Estoque'
                     END
                 WHERE Id = ?`,
                [
                    quantidade,
                    quantidade,
                    itemAtual.IdProduto
                ]
            );

            const [itens] = await conn.execute(
                `SELECT Qtd, Valor
                 FROM Itens_vendas
                 WHERE IdVenda = ?`,
                [vendaId]
            );

            let valorTotal = 0;

            for (const item of itens) {
                valorTotal +=
                    Number(item.Qtd) *
                    Number(item.Valor);
            }

            await conn.execute(
                `UPDATE Vendas
                 SET ValorTotal = ?
                 WHERE Id = ?`,
                [
                    valorTotal,
                    vendaId
                ]
            );

            await conn.commit();

            return {
                vendaId,
                itemId,
                valorTotal
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

export default vendasRepository;