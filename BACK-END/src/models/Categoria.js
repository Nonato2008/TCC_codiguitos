export class Categoria{
    #id;
    #nome;
    #descricao;
    #dataCad;

    constructor(pNome, pDescricao, pId){
        this.nome = pNome;
        this.descricao = pDescricao;
        this.id = pId;
    }

    //metodos acessores getters e setters 
    get id(){
        return this.#id
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
    get descricao(){
        return this.#descricao
    }
    set descricao(value){
        this.#validarDescricao(value)
        this.#descricao = value
    }

    //metodos auxiliares

    #validarId(value){
        if(value & value <= 0){
            throw new Error ('Verifique o ID informado')
        }
    }
    #validarNome(value) {
        if(!value || value.trim().length < 3 || value.trim().length > 45 ){
            throw new Error ('O campo nome é obrigatório e deve ter entre 3 a 45 caracteres');           
        }
    }
    #validarDescricao(value) {
        if(value && (value.trim().length < 10 || value.trim().length > 100)){
            throw new Error ('O campo descrição e deve ter entre 10 a 100 caracteres');           
        }
    }

    //criação de objetos usando o design patterns FACTORY mathod

    static criar(dados){
        return new Categoria(dados.nome, dados.descricao, null);
    }
    static alterar(dados, id){
        return new Categoria(dados.nome, dados.descricao, id);
    }
}