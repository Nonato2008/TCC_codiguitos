import { connection } from "../config/Database.js";

const vendasRepository = {

    // Cria uma nova venda com seus itens e baixa o estoque
    criar: async (venda, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let valorTotal = 0;

            // Verifica se o produto existe e se tem estoque suficiente
            for (const item of itens) {
                const [produtoRows] = await conn.execute(
                    "SELECT Preco, Quantidade FROM Produtos WHERE Id = ?",
                    [item.idProduto]
                );

                if (!produtoRows || produtoRows.length === 0) {
                    throw new Error(`Produto ${item.idProduto} não encontrado.`);
                }

                const produto = produtoRows[0];

                // Impede a venda se não houver estoque
                if (produto.Quantidade < item.qtd) {
                    throw new Error(`Estoque insuficiente para o produto ${item.idProduto}.`);
                }

                // Guarda o preço e soma no total da venda
                const preco = produto.Preco;
                item.valor = preco;
                valorTotal += preco * item.qtd;
            }

            // Insere a venda na tabela Vendas
            const [vendaRows] = await conn.execute(
                `INSERT INTO Vendas (IdProprietario, IdVendedor, ValorTotal)
                 VALUES (?, ?, ?)`,
                [venda.idProprietario, venda.idVendedor, valorTotal]
            );

            const vendaId = vendaRows.insertId;

            // Insere cada item e baixa o estoque
            for (const item of itens) {
                await conn.execute(
                    `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
                     VALUES (?, ?, ?, ?)`,
                    [vendaId, item.idProduto, item.qtd, item.valor]
                );

                // Baixa a quantidade do produto no estoque
                const [alterarResultado] = await conn.execute(
                    "UPDATE Produtos SET Quantidade = Quantidade - ? WHERE Id = ? AND Quantidade >= ?",
                    [item.qtd, item.idProduto, item.qtd]
                );

                if (!alterarResultado || alterarResultado.affectedRows === 0) {
                    throw new Error(`Falha ao atualizar estoque do produto ${item.idProduto}`);
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

    // Edita uma venda existente (troca itens e ajusta estoque)
    editar: async (id, venda, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Devolve o estoque dos itens que serão removidos
            const [itensAntigos] = await conn.execute(
                "SELECT IdProduto, Qtd FROM Itens_vendas WHERE IdVenda = ?",
                [id]
            );

            for (const itemAntigo of itensAntigos) {
                await conn.execute(
                    "UPDATE Produtos SET Quantidade = Quantidade + ? WHERE Id = ?",
                    [itemAntigo.Qtd, itemAntigo.IdProduto]
                );
            }

            // Calcula o novo valor total e valida estoque dos novos itens
            let valorTotal = 0;

            for (const item of itens) {
                const [produtoRows] = await conn.execute(
                    "SELECT Preco, Quantidade FROM Produtos WHERE Id = ?",
                    [item.idProduto]
                );

                if (!produtoRows || produtoRows.length === 0) {
                    throw new Error(`Produto ${item.idProduto} não encontrado.`);
                }

                const produto = produtoRows[0];

                if (produto.Quantidade < item.qtd) {
                    throw new Error(`Estoque insuficiente para o produto ${item.idProduto}.`);
                }

                const preco = produto.Preco;
                item.valor = preco;
                valorTotal += preco * item.qtd;
            }

            // Atualiza os dados da venda
            await conn.execute(
                `UPDATE Vendas
                 SET IdProprietario = ?,
                     IdVendedor = ?,
                     ValorTotal = ?
                 WHERE Id = ?`,
                [venda.idProprietario, venda.idVendedor, valorTotal, id]
            );

            // Remove os itens antigos
            await conn.execute(
                "DELETE FROM Itens_vendas WHERE IdVenda = ?",
                [id]
            );

            // Insere os novos itens e baixa o estoque
            for (const item of itens) {
                await conn.execute(
                    `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
                     VALUES (?, ?, ?, ?)`,
                    [id, item.idProduto, item.qtd, item.valor]
                );

                const [alterarResultado] = await conn.execute(
                    "UPDATE Produtos SET Quantidade = Quantidade - ? WHERE Id = ? AND Quantidade >= ?",
                    [item.qtd, item.idProduto, item.qtd]
                );

                if (!alterarResultado || alterarResultado.affectedRows === 0) {
                    throw new Error(`Falha ao atualizar estoque do produto ${item.idProduto}`);
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

    // Deleta a venda e devolve o estoque dos itens
    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Devolve o estoque de todos os itens da venda
            const [itens] = await conn.execute(
                "SELECT IdProduto, Qtd FROM Itens_vendas WHERE IdVenda = ?",
                [id]
            );

            for (const item of itens) {
                await conn.execute(
                    "UPDATE Produtos SET Quantidade = Quantidade + ? WHERE Id = ?",
                    [item.Qtd, item.IdProduto]
                );
            }

            // Remove os itens e depois a venda
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

    // Remove um item específico da venda e devolve o estoque
    removerItem: async (vendaId, itemId) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Busca o item para saber a quantidade e o produto
            const [itemRows] = await conn.execute(
                "SELECT * FROM Itens_vendas WHERE Id = ? AND IdVenda = ?",
                [itemId, vendaId]
            );

            if (!itemRows || itemRows.length === 0) {
                throw new Error("Item não encontrado na venda");
            }

            const item = itemRows[0];

            // Devolve a quantidade ao estoque
            await conn.execute(
                "UPDATE Produtos SET Quantidade = Quantidade + ? WHERE Id = ?",
                [item.Qtd, item.IdProduto]
            );

            // Remove o item
            await conn.execute(
                "DELETE FROM Itens_vendas WHERE Id = ?",
                [itemId]
            );

            // Recalcula o valor total da venda
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

    // Lista todas as vendas com seus itens
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

    // Busca uma venda pelo ID
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

    // Adiciona um novo item em uma venda já existente
    adicionarItem: async (vendaId, item) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            // Busca o produto e valida estoque
            const [produtoRows] = await conn.execute(
                "SELECT Preco, Quantidade FROM Produtos WHERE Id = ?",
                [item.idProduto]
            );

            if (!produtoRows || produtoRows.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const produto = produtoRows[0];

            if (produto.Quantidade < item.qtd) {
                throw new Error("Estoque insuficiente");
            }

            const valor = produto.Preco;

            // Insere o item
            const [result] = await conn.execute(
                `INSERT INTO Itens_vendas (IdVenda, IdProduto, Qtd, Valor)
                 VALUES (?, ?, ?, ?)`,
                [vendaId, item.idProduto, item.qtd, valor]
            );

            // Atualiza o valor total da venda
            await conn.execute(
                `UPDATE Vendas 
                 SET ValorTotal = ValorTotal + ? 
                 WHERE Id = ?`,
                [valor * item.qtd, vendaId]
            );

            // Baixa o estoque
            const [alterarResultado] = await conn.execute(
                "UPDATE Produtos SET Quantidade = Quantidade - ? WHERE Id = ? AND Quantidade >= ?",
                [item.qtd, item.idProduto, item.qtd]
            );

            if (!alterarResultado || alterarResultado.affectedRows === 0) {
                throw new Error("Falha ao atualizar estoque do produto");
            }

            await conn.commit();

            return { vendaId, itemId: result.insertId };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Altera a quantidade de um item e ajusta o estoque
    editarItem: async (vendaId, itemId, quantidade) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            if (quantidade === undefined || quantidade <= 0) {
                throw new Error("Quantidade inválida");
            }

            // Busca o item atual
            const [itemRows] = await conn.execute(
                "SELECT * FROM Itens_vendas WHERE Id = ? AND IdVenda = ?",
                [itemId, vendaId]
            );

            if (!itemRows || itemRows.length === 0) {
                throw new Error("Item não encontrado na venda");
            }

            const itemAtual = itemRows[0];
            const diferenca = quantidade - itemAtual.Qtd;

            // Ajusta o estoque de acordo com a diferença
            if (diferenca > 0) {
                // Quantidade aumentou → precisa ter estoque
                const [produtoRows] = await conn.execute(
                    "SELECT Quantidade FROM Produtos WHERE Id = ?",
                    [itemAtual.IdProduto]
                );

                if (!produtoRows || produtoRows.length === 0) {
                    throw new Error("Produto não encontrado");
                }

                if (produtoRows[0].Quantidade < diferenca) {
                    throw new Error("Estoque insuficiente");
                }

                await conn.execute(
                    "UPDATE Produtos SET Quantidade = Quantidade - ? WHERE Id = ? AND Quantidade >= ?",
                    [diferenca, itemAtual.IdProduto, diferenca]
                );
            } else if (diferenca < 0) {
                // Quantidade diminuiu → devolve ao estoque
                await conn.execute(
                    "UPDATE Produtos SET Quantidade = Quantidade + ? WHERE Id = ?",
                    [Math.abs(diferenca), itemAtual.IdProduto]
                );
            }

            // Atualiza a quantidade do item
            const valor = itemAtual.Valor;

            await conn.execute(
                `UPDATE Itens_vendas 
                 SET Qtd = ?, Valor = ? 
                 WHERE Id = ?`,
                [quantidade, valor, itemId]
            );

            // Recalcula o valor total da venda
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

    // Altera apenas o status da venda
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