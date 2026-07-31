import { connection } from "../config/Database.js";

const itensVendasRepository = { 
   
    selecionarId: async (id) => {

        const sql = `
            SELECT *
            FROM itens_vendas
            WHERE Id = ?
        `;

        const values = [id];

        const [rows] = await connection.execute(sql, values);

        return rows[0];

}
}

export default itensVendasRepository;