export class ItensPedido {
    #id;
    #pedidoId;
    #ProdutoId;
    #quantidade;
    #valorItem;

    //construtor

    constructor(pProdutoId, pQuantidade, pValorItem, pId, pPedidoId) {
        this.#ProdutoId = pProdutoId;
        this.#quantidade = pQuantidade;
        this.#valorItem = pValorItem;
        this.#id = pId;
        this.#pedidoId = pPedidoId;
    }

    //getter
    get id() {
        return this.#id;
    }
    get pedidoId() {
        return this.#pedidoId;
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
    set pedidoId(value) {
        this.#validarPedidoId(value);
        this.#pedidoId = value
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
    #validarPedidoId(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID do pedido informado");
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
        return new ItensPedido(dados.produtoId, dados.quantidade, dados.valorItem, null, null);
    }
    static alterar(dados, id) {
        return new ItensPedido(dados.produtoId, dados.quantidade, dados.valorItem, id, dados.pedidoId);
    }
}