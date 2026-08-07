import { connection } from "../config/Database.js";

const vendedoresRepository = {

    selecionarId: async (id) => {
        const sql = 
            `SELECT * FROM vendedores WHERE Id = ?`
        ;

        const values = [id]
        const [rows] = await connection.execute(sql, values);
        return rows[0];
    
    },
     criar: async (vendedor) => {

    const sql = `
        INSERT INTO Vendedores
        (
            IdProprietario,
            Nome
        )
        VALUES (?, ?)
    `;

    const values = [
        vendedor.idProprietario,
        vendedor.nome,
    ];

    const [rows] = await connection.execute(sql, values);

    return rows;
},


editar: async (vendedor) => {

    const sql = `
        UPDATE Vendedores
            SET
            idProprietario = ?,
            Nome = ?
            WHERE Id = ?
    `;

    const values = [
        vendedor.idProprietario,
        vendedor.nome,
        vendedor.id
    ];

    const [rows] = await connection.execute(sql, values);

    return rows;
},
}

export default vendedoresRepository;
