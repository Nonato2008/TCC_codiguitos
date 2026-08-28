import {codiguitos_api} from "./tcc.api.js"

export async function getItems(){
    try {
        const response = await codiguitos_api.get("/produtos")

        return response.data;        
    } catch (error) {
        console.log ("Erro ao buscar dados, error");

        return [];
    }
}