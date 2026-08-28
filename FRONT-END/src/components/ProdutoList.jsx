import ProdutoCard from "./ProdutoCard";

export default function ProdutoList({ produtos = [] }) {
  if (!produtos || produtos.length === 0) {
    return <div>Nenhum item encontrado</div>;
  }

  return (
    <div>
      {produtos.map((p) => (
        <ProdutoCard key={p.id ?? p._id ?? p.email} person={p} />
      ))}
    </div>
  );
}