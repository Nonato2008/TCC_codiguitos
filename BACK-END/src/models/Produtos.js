export class Produtos{
    #idProduto;
    #idCategoria;
    #nome;
    #valor;
    #vinculoImagem;

    constructor (pIdCategoria, pNome, pValor, pVinculoImagem, pIdProduto){
        this.idCategoria = pIdCategoria;
        this.nome = pNome;
        this.valor = pValor;
        this.vinculoImagem = pVinculoImagem;
        this.idProduto = pIdProduto;
    }

    //metodos acessores getters e setters 
    get idProduto(){
        return this.#idProduto
    }
    set idProduto(value){
        this.#validaridProduto(value);
        this.#idProduto = value;
    }
    get idCategoria(){
        return this.#idCategoria
    }
    set idCategoria(value){
        this.#validarIdCategoria(value);
        this.#idCategoria = value
    }
    get nome(){
        return this.#nome;
    }
    set nome(value){
        this.#validarNome(value);
        this.#nome = value;
    }
    get valor(){
        return this.#valor
    }
    set valor(value){
        this.#validarValor(value)
        this.#valor = Number(value)
    }
    get vinculoImagem(){
        return this.#vinculoImagem
    }
    set vinculoImagem(value){
        this.#validarPathImagem(value);
        this.#vinculoImagem = value;
    }

    //metodos auxiliares

    #validaridProduto(value){
        if(value & value <= 0){
            throw new Error ('Verifique o ID informado')
        }
    }
    #validarIdCategoria(value){
        if(value & value <= 0){
            throw new Error ('Verifique o ID da Categoria')
        }
    }
    #validarNome(value) {
        if(!value || value.trim().length < 3 || value.trim().length > 45 ){
            throw new Error ('O campo nome é obrigatório e deve ter entre 3 a 45 caracteres');           
        }
    }
    #validarValor(value) {
        if (value === undefined || value === null || isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('O campo valor é obrigatório e deve ser numérico maior que zero');
        }
    }

    #validarPathImagem(value) {
        if (!value){
            throw new Error('Impossivel enviar a imagem');
        }
    }

    //criação de objetos usando o design patterns FACTORY mathod

    static criar(dados){
        return new Produtos(dados.idCategoria, dados.nome, dados.valor, dados.vinculoImagem, null);
    }
    static alterar(dados, idProduto){
        return new Produtos(dados.idCategoria, dados.nome, dados.valor, dados.vinculoImagem, idProduto);
    }
}