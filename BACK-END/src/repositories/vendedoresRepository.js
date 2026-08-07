import { connection } from "../config/Database";

const vendedoresRepository = {

    selecionarId: async (id) => {
        const sql = 
            `SELECT * FROM vendedores WHERE Id = ?`
        ;

        const values = [id]
        const [rows] = await connection.execute(sql, values);
        return rows[0];
    }, 
    
    selecionar: async () => {
        const [rows] = await connection.execute(`
            SELECT *
            FROM vendedores
            ORDER BY vendedores.Id    
        `);
        return rows;
    }
}

export default vendedoresRepository;