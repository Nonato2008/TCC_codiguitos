import { connection } from "../config/Database.js";

const categoriaRepository = {
    
    criar:async (categoria) => {
        const sql = 'INSERT INTO categorias (nome, descricao) VALUES (?, ?)'
        const values = [categoria.nome, categoria.descricao];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    editar:async (categoria) => {
        const sql = 'UPDATE categorias SET nome=?, descricao=? WHERE id = ?;'
        const values = [categoria.nome, categoria.descricao, categoria.id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    deletar:async (id) => {
        const sql = 'DELETE FROM categorias WHERE id = ?;'
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    selecionar:async (id) => {
        const sql = 'SELECT * FROM categorias;'
        const [rows] = await connection.execute(sql);
        return rows
    }
}

export default categoriaRepository