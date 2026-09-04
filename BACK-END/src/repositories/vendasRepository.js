import { connection } from "../config/Database.js";

// CRUD - Create, Read, Update, Delete
const vendasRepository = {

    // Create - POST
    criar: async (venda, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let valorTotal = 0;

            // Validação inicial: a venda deve ter pelo menos um item
            if (!Array.isArray(itens) || itens.length === 0) {
                throw new Error("A venda deve possuir pelo menos um item.");
            }

            for (const item of itens) {

                // Validação de cada item: produto e quantidade
                if (!item.idProduto || !item.qtd || Number(item.qtd) <= 0) {
                    throw new Error("Produto ou quantidade inválida.");
                }

                // Bloqueia a linha do produto para leitura/atualização (evita race condition)
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

                // Verifica se o produto está vencido (comparação de datas)
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const vencimento = new Date(produto.DataVenc);
                vencimento.setHours(0, 0, 0, 0);

                if (vencimento < hoje) {
                    // Atualiza o status para 'Vencido' antes de lançar erro
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
                    // Atualiza o status para 'Esgotado' antes de lançar erro
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

                // Armazena o valor unitário no item para uso posterior
                item.valor = preco;
                valorTotal += preco * Number(item.qtd);
            }

            // Insere a venda com o valor total calculado
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

            // Insere cada item da venda e atualiza o estoque
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

                // Atualiza a quantidade em estoque e ajusta o status automaticamente
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

                // Garantia de que a atualização foi aplicada (otimista)
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

            // Bloqueia os itens antigos para leitura e devolve a quantidade ao estoque
            const [itensAntigos] = await conn.execute(
                `SELECT IdProduto, Qtd
                 FROM Itens_vendas
                 WHERE IdVenda = ?
                 FOR UPDATE`,
                [id]
            );

            // Devolve ao estoque todos os itens que estavam na venda original
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

            // (Re)valida os novos itens (mesma lógica do criar)
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

            // Atualiza os dados da venda
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

            // Remove todos os itens antigos (substituição completa)
            await conn.execute(
                `DELETE FROM Itens_vendas
                 WHERE IdVenda = ?`,
                [id]
            );

            // Insere os novos itens e atualiza o estoque
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

            // Busca os itens da venda para devolver ao estoque
            const [itens] = await conn.execute(
                `SELECT IdProduto, Qtd
                 FROM Itens_vendas
                 WHERE IdVenda = ?
                 FOR UPDATE`,
                [id]
            );

            // Devolve a quantidade de cada produto ao estoque
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

            // Remove os itens e a venda
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

            // Bloqueia o item específico para leitura
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

            // Devolve a quantidade ao estoque do produto
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

            // Remove o item da venda
            await conn.execute(
                `DELETE FROM Itens_vendas
                 WHERE Id = ?`,
                [itemId]
            );

            // Recalcula o valor total da venda com os itens restantes
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

            // Compatibilidade com nomes de campos diferentes
            const produtoId = item.produtoId ?? item.idProduto;
            const quantidade = Number(
                item.quantidade ?? item.qtd
            );

            if (!produtoId || !quantidade || quantidade <= 0) {
                throw new Error("Produto ou quantidade inválida.");
            }

            // Bloqueia o produto para verificar disponibilidade
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

            // Insere o novo item
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

            // Atualiza o estoque
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

            // Atualiza o valor total da venda
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

            // Bloqueia o item existente para leitura
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

            // Bloqueia o produto para verificar estoque e data de vencimento
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

            // Devolve a quantidade antiga ao estoque antes de subtrair a nova
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

            // Verifica o estoque disponível após devolução
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

            // Atualiza a quantidade do item
            await conn.execute(
                `UPDATE Itens_vendas
                 SET Qtd = ?
                 WHERE Id = ?`,
                [
                    quantidade,
                    itemId
                ]
            );

            // Subtrai a nova quantidade do estoque
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

            // Recalcula o valor total da venda
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

}

export default vendasRepository; 





//  ⡴⣶⣿⡄⠀⠀⠀⠀⠀⠀⠀⡤⠞⠉⢳⠀⠀⠀⠀
// ⢀⡇⠘⠋⠓⣆⠀⠀⠀⣀⣠⠞⠀⢀⣴⣫⠶⠚⠛⣷
// ⣿⠀⠒⠘⣠⡾⢀⡴⠋⠉⠀⠀⠀⠉⠋⠁⢀⣠⠶⠃
// ⠈⠙⣏⣿⢧⢿⡏⠀⠀⢠⠄⠀⠀⠀⠀⠀⢻⡀⠀⠀
// ⠀⠀⠉⠘⣟⣾⡄⠀⠀⠀⠈⠓⠘⠃⣀⠀⢈⡇⠀⠀
// ⠀⠀⠀⠀⢿⠉⠛⠦⠀⠀⠀⠀⠀⠀⠀⣠⡞⠁⠀⠀
// ⠀⠀⠀⠀⠘⢧⡀⠀⠀⠀⠀⠀⠀⠘⠋⠉⢙⡆⠀⠀
// ⠀⠀⠀⠀⠀⠀⢻⠀⠀⠀⠀⠀⠀⠀⡤⠖⠋