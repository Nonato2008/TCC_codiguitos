import VendasCard from "./VendasCard";

export default function VendasList({ vendas }) {
    return (
        <div className="sales-card-list">
            {vendas.map((venda) => (
                <VendasCard
                    key={venda.Id}
                    venda={venda}
                />
            ))}
        </div>
    );
}