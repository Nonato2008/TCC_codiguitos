export class Vendas {
    #id;
    #idProprietario;
    #idVendedor;
    #valorTotal;
    #dataCad;

    // Construtor
    constructor(
        pIdProprietario,
        pIdVendedor,
        pValorTotal,
        pId = null,
        pDataCad = null
    ) {
        this.idProprietario = pIdProprietario;
        this.idVendedor = pIdVendedor;
        this.valorTotal = pValorTotal;
        this.id = pId;
        this.dataCad = pDataCad;
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
        if (value !== null && value !== undefined) {
            this.#validarId(value);
        }
        this.#id = value === null || value === undefined ? null : Number(value);
    }

    set idProprietario(value) {
        this.#validarIdProprietario(value);
        this.#idProprietario = Number(value);
    }

    set idVendedor(value) {
        this.#validarIdVendedor(value);
        this.#idVendedor = Number(value);
    }

    set valorTotal(value) {
        this.#validarValorTotal(value);
        this.#valorTotal = Number(value);
    }

    set dataCad(value) {
        this.#dataCad = value;
    }

    // Métodos de validação
    #validarId(value) {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error("Verifique o ID informado.");
        }
    }

    #validarIdProprietario(value) {
        if (!value || Number(value) <= 0) {
            throw new Error("Verifique o ID do proprietário informado.");
        }
    }

    #validarIdVendedor(value) {
        if (!value || Number(value) <= 0) {
            throw new Error("Verifique o ID do vendedor informado.");
        }
    }

    #validarValorTotal(value) {
        if (value == null || Number(value) < 0) {
            throw new Error("O valor total não pode ser negativo.");
        }
    }

    // Design Patterns
    static criar(dados) {
        return new Vendas(
            dados.idProprietario,
            dados.idVendedor,
            dados.valorTotal ?? 0,
            null,
            null
        );
    }

    static alterar(dados, id) {
        return new Vendas(
            dados.idProprietario,
            dados.idVendedor,
            dados.valorTotal ?? 0,
            id,
            null
        );
    }
}