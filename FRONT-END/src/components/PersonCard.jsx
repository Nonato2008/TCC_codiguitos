export default function ProdutoCard({ produto }) {
  return (
    <div className="card p-3 mb-3 shadow-sm">
      <h5>{produto.nome}</h5>
      <p>Email: {produto.preco}</p>
      <p>Telefone: {produto.quantidade}</p>
      <p>Telefone: {produto.status}</p>
      <p>Telefone: {produto.dataVenc}</p>
    </div>
  );
}