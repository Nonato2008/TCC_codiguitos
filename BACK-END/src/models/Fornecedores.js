export class Fornecedores{
    #id;
    #nome;
    #imagem;
    #dataCad;

    constructor (fId, fNome, fImagem = null, fDataCad = null){
        this.#id = fId;
        this.#nome = fNome;
        this.#imagem = fImagem;
        this.#dataCad = fDataCad;
    }

    get id(){
        return this.#id;
    }

    set id(value){
        this.#validarId(value);
        this.#id = value;
    }

    get nome(){
        return this.#nome;
    }

    set nome(value){
        this.#validarNome(value);
        this.#nome = value;
    }

    get imagem(){
        return this.#imagem;
    }

    set imagem(value){
        this.#imagem = value;
    }

    get dataCad(){
        return this.#dataCad;
    }

    set dataCad(value){
        this.#dataCad = value;
    }

    #validarId(value){
        if(!value || isNaN(value) || Number(value) <= 0){
            throw new Error('Verifique o ID informado');
        }
    }

    #validarNome(value){
        if(!value || value.trim().length < 3 || value.trim().length > 45){
            throw new Error('O campo nome é obrigatório e deve ter entre 3 a 45 caracteres');
        }
        if(!isNaN(value)){
            throw new Error('O campo nome deve conter apenas letras e espaços');
        }
    }

    static criar(dados){
        return new Fornecedores(null, dados.nome, dados.imagem, null);
    }

    static alterar(dados, idFornecedor){
        return new Fornecedores(idFornecedor, dados.nome, dados.imagem, null);
    }
}