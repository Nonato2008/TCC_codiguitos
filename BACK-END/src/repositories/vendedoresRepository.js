import { connection } from "../config/Database.js";

const vendedoresRepository = {

    // Read - GET by ID____________________________________________________________________
    selecionarId: async (id) => {
        const sql =
            `SELECT * FROM Vendedores WHERE Id = ?`
            ;

        const values = [id]
        const [rows] = await connection.execute(sql, values);
        return rows[0];

    },
    // Read - GET____________________________________________________________________
    selecionar: async () => {
        const [rows] = await connection.execute(`
            SELECT *
            FROM Vendedores
            ORDER BY Vendedores.Id
        `);
        return rows;
    },
    // Create - POST____________________________________________________________________
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
    // Update - PUT____________________________________________________________________
    editar: async (vendedor) => {

        const sql = `
        UPDATE Vendedores
            SET
            IdProprietario = ?,
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
    // Delete - DELETE____________________________________________________________________
    deletar: async (id) => {
        const sql = `
        DELETE FROM Vendedores
        WHERE Id = ?
    `;
        const values = [id];
        await connection.execute(sql, values);
    }
}

export default vendedoresRepository;