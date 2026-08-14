import { connection } from "../config/Database.js";

const proprietarioRepository = {

    selecionarId: async (id) => {

        const sql = `
            SELECT *
            FROM proprietarios
            WHERE Id = ?
        `;  
        
        const values = [id];
        const [rows] = await connection.execute(sql, values);   
        return rows;
    },
    selecionar: async () => {
        const[rows] = await connection.execute(`
            SELECT *
            FROM proprietarios
            ORDER BY proprietarios.Id    
        `)
        return rows
    },
    criar: async (proprietario) => {

    const sql = `
        INSERT INTO Proprietarios
        (
            Nome,
            Senha
        )
        VALUES (?, ?)
    `;

    const values = [
        proprietario.nome,
        proprietario.senha
    ];

    const [rows] = await connection.execute(sql, values);

    return rows;
},


editar: async (proprietario) => {

    const sql = `
        UPDATE Proprietarios 
            SET
            Nome = ?,
            Senha = ?
            WHERE Id = ?
    `;

    const values = [
        proprietario.nome,
        proprietario.senha,
        proprietario.id
    ];

    const [rows] = await connection.execute(sql, values);

    return rows;
},
deletar: async (id) => {

    const sql = `
        DELETE FROM Proprietarios
        WHERE Id = ?
    `;
    
    const values = [id];
    await connection.execute(sql, values);
}
}

export default proprietarioRepository;