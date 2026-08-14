export class ItensVendas {
    #id;
    #vendaId;
    #ProdutoId;
    #quantidade;
    #valorItem;

    //construtor

    constructor(pProdutoId, pQuantidade, pValorItem, pId, pVendaId) {
        this.#ProdutoId = pProdutoId;
        this.#quantidade = pQuantidade;
        this.#valorItem = pValorItem;
        this.#id = pId;
        this.#vendaId = pVendaId;
    }

    //getter
    get id() {
        return this.#id;
    }
    get vendaId() {
        return this.#vendaId;
    }
    get produtoId() {
        return this.#ProdutoId;
    }
    get quantidade() {
        return this.#quantidade;
    }
    get valorItem() {
        return this.#valorItem;
    }
    //setters
    set id(value) {
        this.#validarId(value);
        this.#id = value
    }
    set vendaId(value) {
        this.#validarVendaId(value);
        this.#vendaId = value
    }
    set produtoId(value) {
        this.#validarProdutoId(value);
        this.#ProdutoId = value
    }
    set quantidade(value) {
        this.#validarQuantidade(value);
        this.#quantidade = value
    }
    set valorItem(value) {
        this.#validarValor(value);
        this.#valorItem = value
    }
    //métodos auxiliares
    #validarId(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID informado");
        }
    }
    #validarVendaId(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID da venda informado");
        }
    }
    #validarProdutoId(value) {
        if (!value || value <= 0) {
            throw new Error("verifique o ID do produto informado");
        }
    }
    #validarQuantidade(value) {
        if (!value || value <= 0) {
            throw new Error("Não foi possivel obter a quantidade");
        }
    }
    #validarValor(value) {
        if (!value || value <= 0) {
            throw new Error("Não foi possivel obter o valor");
        }
    }

    static calcularSubTotalItens(itens) {
        return (itens.reduce(
            (total, item) => total + (item.valorItem * item.quantidade), 0
        ));
    }

    //design patterns

    static criar(dados) {
        return new ItensVendas(dados.produtoId, dados.quantidade, dados.valorItem, null, null);
    }
    static alterar(dados, id) {
        return new ItensVendas(dados.produtoId, dados.quantidade, dados.valorItem, id, dados.vendaId ?? dados.pedidoId);
    }
}