import ProdutoCard from "./ProdutoCard";

export default function ProdutoList({ produtos = [] }) {
  if (!produtos || produtos.length === 0) {
    return <div>Nenhum item encontrado</div>;
  }

  return (
    <div>
      {produtos.map((p) => (
        // Fallback em cascata pra key: tenta id, depois _id (comum em Mongo/APIs),
        // e por último email — garante uma key mesmo se o formato dos dados variar
        <ProdutoCard key={p.id ?? p._id ?? p.email} person={p} />
      ))}
    </div>
  );
}