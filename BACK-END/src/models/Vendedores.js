export class Vendedores {
    #id;
    #nome;
    #dataCad;
    #idProprietario;

    //construtor
    constructor (
        pNome, 
        pIdProprietario, 
        pId
    ){
        this.#nome = pNome;
        this.#idProprietario = pIdProprietario;
        this.#id = pId;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        if (value !== null && value !== undefined) {
            this.#validarId(value);
        }
        this.#id = value === null || value === undefined ? null : Number(value);
    }

    get nome() {
        return this.#nome;
    }

    set nome(value) {
        this.#validarNome(value);
        this.#nome = value.trim();
    }

    get dataCad() {
        return this.#dataCad;
    }

    set dataCad(value) {
        this.#dataCad = value;
    }

    #validarId(value) {
        if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error("Verifique o ID informado.");
        }
    }

    #validarNome(value) {
        if (!value || value.trim().length < 3 || value.trim().length > 45) {
            throw new Error("O nome deve possuir entre 3 e 45 caracteres.");
        }
    }

    static criar(dados) {
        return new Vendedores(
            dados.nome,
            dados.idProprietario,
            dados.id    
        );
    }

    static alterar(dados, id) {
        return new Vendedores(
            dados.nome,
            dados.idProprietario,
            id
        );
    }
}

