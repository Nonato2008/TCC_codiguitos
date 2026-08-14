import { connection } from "../config/Database.js";

const produtosRepository = {
// CRUD - Create, Read, Update, Delete

    //Create - POST____________________________________________________________________
    criar: async (produto) => {

        const sql = `
        INSERT INTO Produtos
        (
            Nome,
            Preco,
            Quantidade,
            Status,
            Imagem,
            DataVenc,
            IdFornecedor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            produto.nome,
            produto.preco,
            produto.quantidade,
            produto.status,
            produto.imagem,
            produto.dataVenc,
            produto.idFornecedor
        ];

        const [rows] = await connection.execute(sql, values);

        return rows;
    },

    // Update - PUT____________________________________________________________________
    editar: async (produto) => {

        const sql = `
        UPDATE Produtos
        SET
            Nome = ?,
            Preco = ?,
            Quantidade = ?,
            Status = ?,
            Imagem = ?,
            DataVenc = ?,
            IdFornecedor = ?
        WHERE Id = ?
    `;

        const values = [
            produto.nome,
            produto.preco,
            produto.quantidade,
            produto.status,
            produto.imagem,
            produto.dataVenc,
            produto.idFornecedor,
            produto.id
        ];

        const [rows] = await connection.execute(sql, values);

        return rows;
    },

    // Delete - DELETE____________________________________________________________________
    deletar: async (id) => {

        const sql = `
        DELETE FROM Produtos
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
        FROM Produtos
    `;
        const [rows] = await connection.execute(sql);
        return rows;
    },

    // Read - GET by ID____________________________________________________________________
    selecionarId: async (id) => {

        const sql = `
        SELECT *
        FROM Produtos
        WHERE Id = ?
    `;

        const values = [id];

        const [rows] = await connection.execute(sql, values);

        return rows;
    }


};

export default produtosRepository;
