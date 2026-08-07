import { connection } from "../config/Database.js";

const vendedoresRepository = {

    selecionarId: async (id) => {
        const sql = 
            `SELECT * FROM vendedores WHERE Id = ?`
        ;

        const values = [id]
        const [rows] = await connection.execute(sql, values);
        return rows[0];
    
    }
}

export default vendedoresRepository;