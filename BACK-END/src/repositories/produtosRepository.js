import { connection } from "../config/Database.js";

const produtosRepository = {
    criar:async (dados) => {
        const sql = 'INSERT INTO produtos (nome, descricao, preco, image, quantidade, idCategoria,) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, dados.idCategoria];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    editar:async (dados) => {
        const sql = 'UPDATE produtos SET  nome=?, descricao=?, preco=?, image=?, quantidade=?, idCategoria=?, WHERE id = ?;'
        const values = [dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, dados.idCategoria, dados.id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    deletar:async (id) => {
        const sql = 'DELETE FROM produtos WHERE id = ?;'
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
        const sql = "SELECT * FROM produtos  WHERE id=?;";
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    }
}

export default produtosRepository