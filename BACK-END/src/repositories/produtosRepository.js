import { connection } from "../config/Database.js";

const produtosRepository = {


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


deletar: async (id) => {

    const sql = `
        DELETE FROM Produtos
        WHERE Id = ?
    `;

    const values = [id];

    const [rows] = await connection.execute(sql, values);

    return rows;
},


selecionar: async () => {
    const sql = `
        SELECT *
        FROM Produtos
    `;
    const [rows] = await connection.execute(sql);
    return rows;
},


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
