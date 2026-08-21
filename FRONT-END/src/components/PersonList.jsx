import PersonCard from "./PersonCard";

export default function PersonList({ produtos = [] }) {
  if (!produtos || produtos.length === 0) {
    return <div>Nenhum item encontrado</div>;
  }

  return (
    <div>
      {produtos.map((p) => (
        <PersonCard key={p.id ?? p._id ?? p.email} person={p} />
      ))}
    </div>
  );
}