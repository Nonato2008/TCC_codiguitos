import { connection } from "../config/Database.js";

const fornecedoresRepository = {
    
    criar:async (fornecedor) => {
        const sql = 'INSERT INTO fornecedores (nome) VALUES (?)'
        const values = [fornecedor.nome];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    editar:async (fornecedor) => {
        const sql = 'UPDATE fornecedores SET nome=? WHERE id = ?;'
        const values = [fornecedor.nome, fornecedor.id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    deletar:async (id) => {
        const sql = 'DELETE FROM fornecedores WHERE id = ?;'
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    selecionar:async (id) => {
        const sql = 'SELECT * FROM fornecedores;'
        const [rows] = await connection.execute(sql);
        return rows
    }
}

export default fornecedoresRepository