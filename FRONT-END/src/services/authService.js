import { codiguitos_api } from "./tcc.api.js";

export async function login(nome, senha) {

    try {

        const response = await codiguitos_api.post("/login", {
            nome,
            senha
        });

        return {
            data: response.data
        };

    } catch (error) {

        if (error.response?.data) {

            return {
                error: error.response.data
            };

        }

        return {
            error: {
                message: "Erro ao conectar ao servidor."
            }
        };
    }
}

export async function cadastro(nome, senha, tipo) {

    try {

        const response = await codiguitos_api.post("/cadastro", {
            nome,
            senha,
            tipo
        });

        return {
            data: response.data
        };

    } catch (error) {

        if (error.response?.data) {

            return {
                error: error.response.data
            };

        }

        return {
            error: {
                message: "Erro ao conectar ao servidor."
            }
        };
    }
}

export function saveUser(usuario) {

    if (!usuario) return;

    localStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
    );
}

export function getUser() {

    const usuario = localStorage.getItem("usuario");

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch {
        return null;
    }
}

export function logout() {

    localStorage.removeItem("usuario");
    localStorage.removeItem("auth_token");
}

export function isLoggedIn() {

    return getUser() !== null;
}

export function isProprietario() {

    const usuario = getUser();

    return usuario?.tipo === "PROPRIETARIO";
}

export function isVendedor() {

    const usuario = getUser();

    return usuario?.tipo === "VENDEDOR";
}