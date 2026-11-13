import axios from "axios";

export const codiguitos_api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

codiguitos_api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^Bearer\s+/i, "")}`;
  }

  return config;
});

export default codiguitos_api;
