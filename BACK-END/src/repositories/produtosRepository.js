import { connection } from "../config/Database.js";

class ProdutosRepository {

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

        const [resultado] = await connection.execute(
            `INSERT INTO Produtos
            (IdFornecedor, Nome, Preco, Quantidade, Status, Imagem, DataVenc)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                idFornecedor,
                nome,
                preco,
                quantidade,
                status,
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
                status,
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
        const [resultado] = await connection.execute(
            `SELECT * FROM Produtos ORDER BY Id DESC`
        );

        return resultado;
    }

    async selecionarId(id) {
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

                if (novaQuantidade <= 0) {
                    status = "Esgotado";
                } else if (vencimento < hoje) {
                    status = "Vencido";
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
