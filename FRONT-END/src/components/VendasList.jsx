import VendasCard from "./VendasCard";

export default function VendasList({ vendas }) {
    return (
        <div>
            {vendas.map((venda) => (
                <VendasCard
                    key={venda.Id}
                    venda={venda}
                />
            ))}
        </div>
    );
}