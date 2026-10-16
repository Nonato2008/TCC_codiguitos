import { connection } from "../config/Database.js";

class ProdutosRepository {

    calcularStatusProduto(produto) {
        const quantidade = Number(produto?.Quantidade ?? produto?.quantidade ?? 0);
        const dataVenc = produto?.DataVenc ?? produto?.dataVenc ?? produto?.data_venc;

        if (!dataVenc) {
            return quantidade <= 0 ? "Esgotado" : "Em Estoque";
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const dataVencimento = String(dataVenc).trim();
        const vencimento = /^\d{4}-\d{2}-\d{2}$/.test(dataVencimento)
            ? new Date(
                Number(dataVencimento.slice(0, 4)),
                Number(dataVencimento.slice(5, 7)) - 1,
                Number(dataVencimento.slice(8, 10))
            )
            : new Date(dataVencimento);

        if (Number.isNaN(vencimento.getTime())) {
            return quantidade <= 0 ? "Esgotado" : "Em Estoque";
        }

        vencimento.setHours(0, 0, 0, 0);

        if (vencimento < hoje) {
            return "Vencido";
        }

        if (quantidade <= 0) {
            return "Esgotado";
        }

        return "Em Estoque";
    }

    async sincronizarStatusPorId(idProduto, dadosExtras = {}) {
        const [produtos] = await connection.execute(
            `SELECT * FROM Produtos WHERE Id = ?`,
            [idProduto]
        );

        if (!produtos.length) {
            return null;
        }

        const produtoAtual = produtos[0];
        const quantidade = Number(dadosExtras.quantidade ?? produtoAtual.Quantidade ?? 0);
        const dataVenc = dadosExtras.dataVenc ?? produtoAtual.DataVenc ?? null;
        const statusCalculado = this.calcularStatusProduto({
            ...produtoAtual,
            Quantidade: quantidade,
            DataVenc: dataVenc,
        });

        if (produtoAtual.Status !== statusCalculado) {
            await connection.execute(
                `UPDATE Produtos SET Status = ? WHERE Id = ?`,
                [statusCalculado, idProduto]
            );
        }

        return statusCalculado;
    }

    async sincronizarTodosStatus() {
        const [produtos] = await connection.execute(`SELECT * FROM Produtos`);

        for (const produto of produtos) {
            const statusCalculado = this.calcularStatusProduto(produto);

            if (produto.Status !== statusCalculado) {
                await connection.execute(
                    `UPDATE Produtos SET Status = ? WHERE Id = ?`,
                    [statusCalculado, produto.Id]
                );
            }
        }

        return true;
    }

    async criar(produto) {
        const {
            idFornecedor,
            nome,
            preco,
            quantidade,
            status,
            imagem,
            dataVenc
        } = produto;

        const statusFinal = this.calcularStatusProduto({
            Quantidade: quantidade,
            DataVenc: dataVenc,
            Status: status,
        });

        const [resultado] = await connection.execute(
            `INSERT INTO Produtos
            (IdFornecedor, Nome, Preco, Quantidade, Status, Imagem, DataVenc)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                idFornecedor,
                nome,
                preco,
                quantidade,
                statusFinal,
                imagem,
                dataVenc
            ]
        );

        return resultado;
    }

    async editar(produto) {
        const {
            idFornecedor,
            nome,
            preco,
            quantidade,
            status,
            imagem,
            dataVenc,
            id
        } = produto;

        const statusFinal = this.calcularStatusProduto({
            Quantidade: quantidade,
            DataVenc: dataVenc,
            Status: status,
        });

        const [resultado] = await connection.execute(
            `UPDATE Produtos
             SET IdFornecedor = ?,
                 Nome = ?,
                 Preco = ?,
                 Quantidade = ?,
                 Status = ?,
                 Imagem = ?,
                 DataVenc = ?
             WHERE Id = ?`,
            [
                idFornecedor,
                nome,
                preco,
                quantidade,
                statusFinal,
                imagem,
                dataVenc,
                id
            ]
        );

        return resultado;
    }

    async deletar(id) {
        const [resultado] = await connection.execute(
            `DELETE FROM Produtos WHERE Id = ?`,
            [id]
        );

        return resultado;
    }

    async selecionar() {
        await this.sincronizarTodosStatus();

        const [resultado] = await connection.execute(
            `SELECT * FROM Produtos ORDER BY Id DESC`
        );

        return resultado;
    }

    async selecionarId(id) {
        await this.sincronizarTodosStatus();

        const [resultado] = await connection.execute(
            `SELECT * FROM Produtos WHERE Id = ?`,
            [id]
        );

        return resultado[0];
    }

    async entradaMercadoria(itens) {
        const connectionTransaction = await connection.getConnection();

        try {
            await connectionTransaction.beginTransaction();

            for (const item of itens) {
                const [produto] = await connectionTransaction.execute(
                    `SELECT Id, Quantidade
                     FROM Produtos
                     WHERE Id = ?
                     FOR UPDATE`,
                    [item.idProduto]
                );

                if (produto.length === 0) {
                    throw new Error(
                        `Produto com ID ${item.idProduto} não encontrado.`
                    );
                }

                const quantidadeAtual = Number(produto[0].Quantidade);
                const quantidadeEntrada = Number(item.quantidade);
                const novaQuantidade =
                    quantidadeAtual + quantidadeEntrada;

                const dataVenc = item.dataVenc;
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const vencimento = new Date(`${dataVenc}T00:00:00`);
                vencimento.setHours(0, 0, 0, 0);

                let status = "Em Estoque";

                if (vencimento < hoje) {
                    status = "Vencido";
                } else if (novaQuantidade <= 0) {
                    status = "Esgotado";
                }

                await connectionTransaction.execute(
                    `UPDATE Produtos
                     SET Quantidade = ?,
                         DataVenc = ?,
                         Status = ?
                     WHERE Id = ?`,
                    [
                        novaQuantidade,
                        dataVenc,
                        status,
                        item.idProduto
                    ]
                );
            }

            await connectionTransaction.commit();

            return {
                sucesso: true,
                mensagem:
                    "Entrada de mercadorias realizada com sucesso."
            };

        } catch (error) {
            await connectionTransaction.rollback();
            throw error;
        } finally {
            connectionTransaction.release();
        }
    }
}

export default new ProdutosRepository();
