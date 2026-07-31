import { connection } from "../config/Database.js";

// CRUD - Create, Read, Update, Delete
const pedidoRepository = {

    // Create - POST
    criar: async (pedido, itens) => { 
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let subTotal = 0;

            // Calcular o subtotal dos itens
            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                // Verificar se o produto existe
                if (produto.length === 0) {
                    throw new Error(`Produto ${item.produtoId} não encontrado`);
                }

                // Calcular o subtotal
                const valor = produto[0].Valor;
                subTotal += valor * item.quantidade;
            }

            // Inserir o pedido
            const [rowsPed] = await conn.execute(
                "INSERT INTO pedidos(, valorTotal, Status) VALUES (?, ?, ?)",
                [subTotal, pedido.status]
            );

            // Inserir os itens do pedido
            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                const valor = produto[0].Valor;

                // Inserir o item do pedido
                await conn.execute(
                    `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
                     VALUES (?, ?, ?, ?)`,
                    [rowsPed.insertId, item.produtoId, item.quantidade, valor]
                );
            }

            await conn.commit();
            return { id: rowsPed.insertId, subTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Update - PUT
    editar: async (id, pedido, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let subTotal = 0;

            // Calcular o subtotal dos itens
            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                // Verificar se o produto existe
                if (produto.length === 0) {
                    throw new Error(`Produto ${item.produtoId} não encontrado`);
                }

                // Calcular o subtotal
                const valor = produto[0].Valor;
                subTotal += valor * item.quantidade;
            }

            // Atualizar o pedido
            await conn.execute(
                "UPDATE pedidos SET valorTotal = ?, Status = ? WHERE id = ?",
                [pedido.clienteId, subTotal, pedido.status, id]
            );

            // Atualizar os itens do pedido
            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                const valor = produto[0].Valor;
                
                await conn.execute(
                    `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
                     VALUES (?, ?, ?, ?)`,
                    [id, item.produtoId, item.quantidade, valor]
                );
            }

            // Commit da transação
            await conn.commit();
            return { id, subTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Delete - DELETE
    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Deletar os itens do pedido
            await conn.execute(
                "DELETE FROM itens_pedidos WHERE pedidoId = ?",
                [id]
            );

            // Deletar o pedido
            await conn.execute(
                "DELETE FROM pedidos WHERE id = ?",
                [id]
            );

            // Commit da transação
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

            // Verificar se o item existe no pedido
            const [item] = await conn.execute(
                "SELECT * FROM itens_pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            // Se o item não existir, lançar um erro
            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            // Deletar o item do pedido
            await conn.execute(
                "DELETE FROM itens_pedidos WHERE id = ?",
                [itemId]
            );

            // Recalcular o subtotal do pedido
            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let subTotal = 0;

            // Calcular o subtotal dos itens restantes
            itens.forEach(i => {
                subTotal += i.Quatidade * i.valorItem;
            });

            // Atualizar o subtotal do pedido
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

        // Selecionar todos os pedidos com seus itens
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

   // 
    adicionarItem: async (pedidoId, item) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Pegar o preço do produto
            const [produto] = await conn.execute(
                "SELECT preco FROM produtos WHERE id = ?",
                [item.produtoId]
            );

            // Verificar se o preço do produto nao é nulo
            if (produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const valor = produto[0].Valor;

            // Inserir o item do pedido
            await conn.execute(
                `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
             VALUES (?, ?, ?, ?)`,
                [pedidoId, item.produtoId, item.quantidade, valor]
            );

            // Atualizar o subtotal do pedido
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

    // Update - PUT by ID
    editarItem: async (pedidoId, itemId, quantidade) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Validar a quantidade
            if (quantidade === undefined || quantidade <= 0) {
                throw new Error("Quantidade inválida");
            }

    
            const [item] = await conn.execute(
                "SELECT * FROM itens_pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            // Se o item não existir, lançar um erro
            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            // Pegar o preço do produto
            const [produto] = await conn.execute(
                "SELECT preco FROM produtos WHERE idProduto = ?",
                [item[0].ProdutoId]
            );

            // Verificar se o produto existe
            if (!produto || produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const valor = produto[0].Valor;

            // Atualizar a quantidade e o valor do item
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

            // Atualizar o subtotal do pedido
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

export default pedidoRepository;








//  ⡴⣶⣿⡄⠀⠀⠀⠀⠀⠀⠀⡤⠞⠉⢳⠀⠀⠀⠀
// ⢀⡇⠘⠋⠓⣆⠀⠀⠀⣀⣠⠞⠀⢀⣴⣫⠶⠚⠛⣷
// ⣿⠀⠒⠘⣠⡾⢀⡴⠋⠉⠀⠀⠀⠉⠋⠁⢀⣠⠶⠃
// ⠈⠙⣏⣿⢧⢿⡏⠀⠀⢠⠄⠀⠀⠀⠀⠀⢻⡀⠀⠀
// ⠀⠀⠉⠘⣟⣾⡄⠀⠀⠀⠈⠓⠘⠃⣀⠀⢈⡇⠀⠀
// ⠀⠀⠀⠀⢿⠉⠛⠦⠀⠀⠀⠀⠀⠀⠀⣠⡞⠁⠀⠀
// ⠀⠀⠀⠀⠘⢧⡀⠀⠀⠀⠀⠀⠀⠘⠋⠉⢙⡆⠀⠀
// ⠀⠀⠀⠀⠀⠀⢻⠀⠀⠀⠀⠀⠀⠀⡤⠖⠋