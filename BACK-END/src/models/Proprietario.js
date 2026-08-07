export class Proprietario {
    #id;
    #nome;
    #senha;
    #dataCad;

    constructor(
        id = null,
        nome,
        senha,
        dataCad = null
    ) {
        this.id = id;
        this.nome = nome;
        this.senha = senha;
        this.dataCad = dataCad;
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

    get senha() {
        return this.#senha;
    }

    set senha(value) {
        if (!value || value.trim().length < 6) {
            throw new Error("A senha deve possuir pelo menos 6 caracteres.");
        }
        this.#senha = value;
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
        return new Proprietario(
            dados.id,
            dados.nome,
            dados.senha,
            dados.dataCad
        );
    }

    static alterar(dados, id) {
        return new Proprietario(
            id,
            dados.nome,
            dados.senha,
            dados.dataCad
        );
    }
}
