import { connection } from "../config/Database.js";

const fornecedoresRepository = {
// CRUD - Create, Read, Update, Delete

    // Read - GET by ID____________________________________________________________________
    criar: async (fornecedor) => {

        const sql = `
        INSERT INTO Fornecedores
        (
            Nome,
            Imagem
        )
        VALUES (?, ?)
    `;

        const values = [
            fornecedor.nome,
            fornecedor.imagem
        ];

        const [rows] = await connection.execute(sql, values);

        return rows;
    },

    // Update - PUT____________________________________________________________________
    editar: async (fornecedor) => {

        let sql;
        let values;

        if (fornecedor.imagem) {

            sql = `
            UPDATE Fornecedores
            SET
                Nome = ?,
                Imagem = ?
            WHERE Id = ?
        `;

            values = [
                fornecedor.nome,
                fornecedor.imagem,
                fornecedor.id
            ];

        } else {

            sql = `
            UPDATE Fornecedores
            SET
                Nome = ?
            WHERE Id = ?
        `;

            values = [
                fornecedor.nome,
                fornecedor.id
            ];
        }


        const [rows] = await connection.execute(sql, values);

        return rows;
    },

    // Delete - DELETE____________________________________________________________________
    deletar: async (id) => {

        const sql = `
        DELETE FROM Fornecedores
        WHERE Id = ?
    `;

        const values = [id];

        const [rows] = await connection.execute(sql, values);

        return rows;
    },

    // Read - GET____________________________________________________________________
    selecionar: async () => {

        const sql = `
        SELECT *
        FROM Fornecedores
    `;

        const [rows] = await connection.execute(sql);

        return rows;
    },

    // Read - GET by ID____________________________________________________________________
    selecionarId: async (id) => {

        const sql = `
        SELECT *
        FROM Fornecedores
        WHERE Id = ?
    `;

        const values = [id];

        const [rows] = await connection.execute(sql, values);

        return rows;
    }


};

export default fornecedoresRepository;
