import { useEffect, useState } from "react";
import { getItems } from "../services/personService.js";

export function useProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //useEffect por padrão não é assincrona
        async function loadProdutos() {
            try {

                const data = await getItems();

                setProdutos(data);

            } catch (error) {

                console.log("Erro ao buscar produtos", error);

            } finally {

                setLoading(false);

            }
        }

        loadProdutos();

    }, [])

    //todo componente react tem que ter return
    return { produtos, loading };
}