<<<<<<< HEAD
import { buscarProdutos } from "./tcc.api";

export async function getAdega() {
    try {
        const response = await buscarProdutos.get("/produtos");
        
        return response.data
    } catch (error) {
        console.error("Erro ao buscar dados", error)

        return[]
=======
import {codiguitos_api} from "./tcc.api.js"

export async function getItems(){
    try {
        const response = await codiguitos_api.get("/produtos")

        return response.data;        
    } catch (error) {
        console.log ("Erro ao buscar dados, error");

        return [];
>>>>>>> a064cb4b9715c909259d3be1d48a9fb63ad919cc
    }
}