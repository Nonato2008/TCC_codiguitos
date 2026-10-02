import { Link } from "react-router-dom";
import { CalendarDays, CreditCard, Eye, Package2 } from "lucide-react";

export default function VendasCard({ venda }) {
    const id = venda.Id ?? venda.id;
    const vendedor = venda.NomeVendedor ?? venda.nomeVendedor ?? `Vendedor #${venda.IdVendedor ?? venda.idVendedor ?? "—"}`;
    const iniciais = vendedor
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase();
    const pagamento = venda.formaPagamento ?? venda.FormaPagamento ?? venda.forma_pagamento ?? venda.formaDePagamento ?? "Não informado";
    const data = venda.DataCad ?? venda.dataCad ?? venda.Data ?? venda.data;
    const total = Number(venda.ValorTotal ?? venda.valorTotal ?? 0);
    const itens = Number(venda.QuantidadeItens ?? venda.quantidadeItens);

    return (
        <article className="sale-card">
            <div className="sale-card__avatar" aria-hidden="true">{iniciais || "V"}</div>

            <div className="sale-card__content">
                <div className="sale-card__heading">
                    <div className="sale-card__identity">
                        <span className="sale-card__id">Venda #{id}</span>
                        <span className="sales-status-badge">Registrada</span>
                    </div>
                    <strong className="sale-card__amount">{formatarMoeda(total)}</strong>
                </div>

                <span className="sale-card__seller">{vendedor}</span>

                <div className="sale-card__metadata">
                    <span><CalendarDays size={14} aria-hidden="true" />{formatarData(data)}</span>
                    <span><CreditCard size={14} aria-hidden="true" />{pagamento}</span>
                    <span><Package2 size={14} aria-hidden="true" />{Number.isFinite(itens) ? `${itens} ${itens === 1 ? "produto" : "produtos"}` : "Itens indisponíveis"}</span>
                </div>
            </div>

            <Link className="sale-card__details" to={`/vendas/${id}`} aria-label={`Ver detalhes da venda ${id}`}>
                <Eye size={17} aria-hidden="true" />
                <span>Detalhes</span>
            </Link>
        </article>
    );
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(valor) {
    if (!valor) return "Data indisponível";
    const dateOnly = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const data = dateOnly
        ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
        : new Date(valor);
    return Number.isNaN(data.getTime()) ? "Data indisponível" : data.toLocaleDateString("pt-BR");
}