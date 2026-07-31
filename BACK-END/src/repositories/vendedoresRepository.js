import { connection } from "../config/Database";

<<<<<<< HEAD

=======
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
>>>>>>> 6bf6865bba0d29dfd7daa06123be94080e2b51a5
