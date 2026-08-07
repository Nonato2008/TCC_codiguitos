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
    }
}

export default proprietarioRepository;