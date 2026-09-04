export class Fornecedores {


    #id;
    #nome;
    #imagem;
    #dataCad;


    constructor(
        fId,
        fNome,
        fImagem,
        fDataCad = null
    ) {
        this.id = fId;
        this.nome = fNome;
        this.imagem = fImagem;
        this.dataCad = fDataCad;
    }


    // GETTERS E SETTERS

    get id() {
        return this.#id;
    }

    set id(value) {

        if (value === null || value === undefined) {
            this.#id = null;
            return;
        }

        this.#validarId(value);

        this.#id = Number(value);
    }


    get nome() {
        return this.#nome;
    }

    set nome(value) {

        this.#validarNome(value);

        this.#nome = value;
    }


    get imagem() {
        return this.#imagem;
    }

    set imagem(value) {

        if (value !== null && value !== undefined) {
            this.#validarImagem(value);
        }

        this.#imagem = value;
    }


    get dataCad() {
        return this.#dataCad;
    }

    set dataCad(value) {

        this.#dataCad = value;
    }


    // MÉTODOS DE VALIDAÇÃO

    #validarId(value) {

        if (
            !value ||
            isNaN(Number(value)) ||
            Number(value) <= 0
        ) {
            throw new Error(
                'Verifique o ID informado'
            );
        }
    }


    #validarNome(value) {

        if (
            !value ||
            value.trim().length < 3 ||
            value.trim().length > 45
        ) {
            throw new Error(
                'O campo nome é obrigatório e deve ter entre 3 e 45 caracteres'
            );
        }

        if (!isNaN(value)) {

            throw new Error(
                'O campo nome deve conter apenas letras e espaços'
            );
        }
    }


    #validarImagem(value) {

        if (
            !value ||
            value.trim().length === 0
        ) {
            throw new Error(
                'A imagem é obrigatória'
            );
        }
    }


    // FACTORY METHOD - CRIAR

    static criar(dados) {

        return new Fornecedores(
            null,
            dados.nome,
            dados.imagem,
            null
        );
    }


    // FACTORY METHOD - ALTERAR

    static alterar(dados, idFornecedor) {

        return new Fornecedores(
            idFornecedor,
            dados.nome,
            dados.imagem,
            null
        );
    }


}
