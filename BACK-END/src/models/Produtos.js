export class Produtos {
    #id;
    #idFornecedor;
    #nome;
    #preco;
    #quantidade;
    #status;
    #imagem;
    #dataCad;
    #dataVenc;

    constructor(
        pIdFornecedor,
        pNome,
        pPreco,
        pQuantidade,
        pStatus,
        pImagem,
        pDataVenc,
        pId = null,
        pDataCad = null
    ){
        this.idFornecedor = pIdFornecedor;
        this.nome = pNome;
        this.preco = pPreco;
        this.quantidade = pQuantidade;
        this.status = pStatus;
        this.imagem = pImagem;
        this.dataVenc = pDataVenc;
        this.id = pId;
        this.dataCad = pDataCad;
    }

    // Getters e Setters

    get id(){
        return this.#id;
    }
    set id(value){
        if(value !== null && value !== undefined){
            this.#validarId(value);
        }
        this.#id = value;
    }

    get idFornecedor(){
        return this.#idFornecedor;
    }
    set idFornecedor(value){
        this.#validarIdFornecedor(value);
        this.#idFornecedor = Number(value);
    }

    get nome(){
        return this.#nome;
    }
    set nome(value){
        this.#validarNome(value);
        this.#nome = value.trim();
    }

    get preco(){
        return this.#preco;
    }
    set preco(value){
        this.#validarPreco(value);
        this.#preco = Number(value);
    }

    get quantidade(){
        return this.#quantidade;
    }
    set quantidade(value){
        this.#validarQuantidade(value);
        this.#quantidade = Number(value);
    }

    get status(){
        return this.#status;
    }
    set status(value){
        this.#validarStatus(value);
        this.#status = value;
    }

    get imagem(){
        return this.#imagem;
    }
    set imagem(value){
        this.#validarImagem(value);
        this.#imagem = value;
    }

    get dataCad(){
        return this.#dataCad;
    }
    set dataCad(value){
        this.#dataCad = value;
    }

    get dataVenc(){
        return this.#dataVenc;
    }
    set dataVenc(value){
        this.#validarDataVenc(value);
        this.#dataVenc = value;
    }

    // Métodos de validação

    #validarId(value){
        if(isNaN(Number(value)) || Number(value) <= 0){
            throw new Error("Verifique o ID informado.");
        }
    }

    #validarIdFornecedor(value){
        if(isNaN(Number(value)) || Number(value) <= 0){
            throw new Error("Verifique o ID do fornecedor.");
        }
    }

    #validarNome(value){
        if(!value || value.trim().length < 3 || value.trim().length > 45){
            throw new Error("O nome deve possuir entre 3 e 45 caracteres.");
        }
    }

    #validarPreco(value){
        if(value === null || value === undefined || isNaN(Number(value)) || Number(value) <= 0){
            throw new Error("O preço deve ser maior que zero.");
        }
    }

    #validarQuantidade(value){
        if(isNaN(Number(value)) || Number(value) < 0){
            throw new Error("A quantidade deve ser um número maior ou igual a zero.");
        }
    }

    #validarStatus(value){
        const statusValidos = [
            "Em Estoque",
            "Vencido",
            "Esgotado"
        ];

        if(!statusValidos.includes(value)){
            throw new Error("Status inválido.");
        }
    }

    #validarImagem(value){
        if(!value || value.trim() === ""){
            throw new Error("A imagem é obrigatória.");
        }
    }

    #validarDataVenc(value){
        if(!value){
            throw new Error("A data de vencimento é obrigatória.");
        }

        const data = new Date(value);

        if(isNaN(data.getTime())){
            throw new Error("Data de vencimento inválida.");
        }
    }

    // Factory Methods

    static criar(dados){
        return new Produtos(dados.idFornecedor, dados.nome, dados.preco, dados.quantidade,dados.status, dados.imagem, dados.dataVenc);
    }

    static alterar(dados, id){
        return new Produtos(dados.idFornecedor, dados.nome, dados.preco, dados.quantidade,dados.status, dados.imagem, dados.dataVenc,id);
    }
}