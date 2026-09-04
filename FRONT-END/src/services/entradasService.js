import api from "./tcc.api";

export async function registrarEntrada(dados) {

    const resposta = await api.post(
        "/entrada-estoque",
        dados
    );

    return resposta.data;
}