export class ItensVendas {
    #id;
    #idVenda;
    #idProduto;
    #qtd;
    #valor;

    // Construtor
    constructor(pIdVenda, pIdProduto, pQtd, pValor, pId = null) {
        this.idVenda = pIdVenda;
        this.idProduto = pIdProduto;
        this.qtd = pQtd;
        this.valor = pValor;
        this.id = pId;
    }

    // Getters
    get id() {
        return this.#id;
    }

    get idVenda() {
        return this.#idVenda;
    }

    get idProduto() {
        return this.#idProduto;
    }

    get qtd() {
        return this.#qtd;
    }

    get valor() {
        return this.#valor;
    }

    // Setters
    set id(value) {
        this.#validarId(value);
        this.#id = value;
    }

    set idVenda(value) {
        this.#validarIdVenda(value);
        this.#idVenda = value;
    }

    set idProduto(value) {
        this.#validarIdProduto(value);
        this.#idProduto = value;
    }

    set qtd(value) {
        this.#validarQtd(value);
        this.#qtd = value;
    }

    set valor(value) {
        this.#validarValor(value);
        this.#valor = value;
    }

    // Métodos auxiliares
    #validarId(value) {
        if (value && value <= 0) {
            throw new Error("Verifique o ID informado.");
        }
    }

    #validarIdVenda(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID da venda informado.");
        }
    }

    #validarIdProduto(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID do produto informado.");
        }
    }

    #validarQtd(value) {
        if (!value || value <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }
    }

    #validarValor(value) {
        if (value == null || value <= 0) {
            throw new Error("O valor deve ser maior que zero.");
        }
    }

    // Calcula o total dos itens da venda
    static calcularTotalItens(itens) {
        return itens.reduce(
            (total, item) => total + (item.valor * item.qtd),
            0
        );
    }

    // Design Patterns
    static criar(dados) {
<<<<<<< HEAD
        return new ItensVendas(dados.idVenda, dados.idProduto, dados.qtd, dados.valor, null
        );
=======
        return new ItensVendas(dados.produtoId, dados.quantidade, dados.valorItem, null, null);
>>>>>>> Adicionar_Vendas_e_Itens_Vendas
    }

    static alterar(dados, id) {
<<<<<<< HEAD
        return new ItensVendas(dados.idVenda, dados.idProduto, dados.qtd, dados.valor, id);
=======
        return new ItensVendas(dados.produtoId, dados.quantidade, dados.valorItem, id, dados.pedidoId);
>>>>>>> Adicionar_Vendas_e_Itens_Vendas
    }
}