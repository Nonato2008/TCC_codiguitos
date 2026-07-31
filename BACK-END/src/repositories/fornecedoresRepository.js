import { connection } from "../config/Database.js";

const fornecedoresRepository = {


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


deletar: async (id) => {

    const sql = `
        DELETE FROM Fornecedores
        WHERE Id = ?
    `;

    const values = [id];

    const [rows] = await connection.execute(sql, values);

    return rows;
},


selecionar: async () => {

    const sql = `
        SELECT *
        FROM Fornecedores
    `;

    const [rows] = await connection.execute(sql);

    return rows;
},


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
