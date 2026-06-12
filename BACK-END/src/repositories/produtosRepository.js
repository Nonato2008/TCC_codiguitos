import { connection } from "../config/Database.js";

const produtosRepository = {
    criar:async (produto) => {
        const sql = 'INSERT INTO produtos (Nome, Preco, Quantidade, Status, Imagem, DataVenc, IdFornecedor) VALUES (?, ?, ?, ?, ?)';
        const values = [produto.nome, produto.preco, produto.quantidade, produto.status, produto.imagem, produto.dataVenc, produto.idFornecedor];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    editar:async (produto) => {
        const sql = 'UPDATE produtos SET Nome=?, Preco=?,  Quantidade=?, Status=?, Imagem=?, DataVenc=?, idFornecedor=? WHERE Id = ?;'
        const values = [produto.nome, produto.preco, produto.quantidade, produto.status, produto.imagem, produto.dataVenc, produto.idFornecedor];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    deletar:async (id) => {
        const sql = 'DELETE FROM produtos WHERE Id = ?;'
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    selecionar:async () => {
        const sql = 'SELECT * FROM produtos;'
        const [rows] = await connection.execute(sql);
        return rows
    },

    selecionarId: async (id)=> {
        const sql = "SELECT * FROM produtos  WHERE Id=?;";
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    }
}

export default produtosRepository