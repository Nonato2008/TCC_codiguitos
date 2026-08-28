import { codiguitos_api } from "./tcc.api.js";

export async function login(email, password) {
  try {
    const response = await codiguitos_api.post("/login", { email, password });
    return { data: response.data };
  } catch (error) {
    if (error.response && error.response.data) {
      return { error: error.response.data };
    }
    return { error: { message: "Erro de rede" } };
  }
}

export function saveToken(token) {
  if (!token) return;
  localStorage.setItem("auth_token", token);
}

export function getToken() {
  return localStorage.getItem("auth_token");
}
