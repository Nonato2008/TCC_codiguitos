export class Vendas {
    #id;
    #idProprietario;
    #idVendedor;
    #valorTotal;
    #dataCad;

    // Construtor
    constructor(pIdProprietario, pIdVendedor, pValorTotal, pId, pDataCad = null) {
        this.idProprietario = pIdProprietario;
        this.idVendedor = pIdVendedor;
        this.valorTotal = pValorTotal;
        this.id = pId;
        this.#dataCad = pDataCad;
    }

    // Getters
    get id() {
        return this.#id;
    }

    get idProprietario() {
        return this.#idProprietario;
    }

    get idVendedor() {
        return this.#idVendedor;
    }

    get valorTotal() {
        return this.#valorTotal;
    }

    get dataCad() {
        return this.#dataCad;
    }

    // Setters
    set id(value) {
        this.#validarId(value);
        this.#id = value;
    }

    set idProprietario(value) {
        this.#validarIdProprietario(value);
        this.#idProprietario = value;
    }

    set idVendedor(value) {
        this.#validarIdVendedor(value);
        this.#idVendedor = value;
    }

    set valorTotal(value) {
        this.#validarValorTotal(value);
        this.#valorTotal = value;
    }

    // Métodos auxiliares
    #validarId(value) {
        if (value && value <= 0) {
            throw new Error("Verifique o ID informado.");
        }
    }

    #validarIdProprietario(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID do proprietário informado.");
        }
    }

    #validarIdVendedor(value) {
        if (!value || value <= 0) {
            throw new Error("Verifique o ID do vendedor informado.");
        }
    }

    #validarValorTotal(value) {
        if (value == null || value <= 0) {
            throw new Error("O valor total deve ser maior que zero.");
        }
    }

    // Design Patterns
    static criar(dados) {
        return new Vendas(dados.idProprietario,dados.idVendedor,
            dados.valorTotal,
            null
        );
    }

    static alterar(dados, id) {
        return new Vendas(dados.idProprietario, dados.idVendedor, dados.valorTotal, id);
    }
}