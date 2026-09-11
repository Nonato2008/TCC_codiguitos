import mysql from 'mysql2/promise';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 3306),
});

const [rows] = await conn.query('SELECT Id, Nome, Quantidade, Status, Imagem, DataVenc, IdFornecedor, Preco FROM Produtos LIMIT 1');
console.log('ROW', rows[0]);
if (!rows[0]) {
  await conn.end();
  process.exit(0);
}

const produto = rows[0];
const fd = new FormData();
fd.append('idFornecedor', String(produto.IdFornecedor ?? 1));
fd.append('nome', String(produto.Nome));
fd.append('preco', String(produto.Preco ?? 10));
fd.append('quantidade', String(Number(produto.Quantidade) + 1));
fd.append('dataVenc', String(produto.DataVenc || '2025-12-31'));
if (produto.Imagem) fd.append('imagem', produto.Imagem);

try {
  const res = await axios.put(`http://localhost:8000/produtos/${produto.Id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('STATUS', res.status);
  console.log('DATA', res.data);
} catch (e) {
  console.log('ERROR_STATUS', e.response && e.response.status);
  console.log('ERROR_DATA', e.response && e.response.data);
}

await conn.end();
