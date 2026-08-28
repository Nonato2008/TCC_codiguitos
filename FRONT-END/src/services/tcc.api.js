import axios from "axios";

export const codiguitos_api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

export default codiguitos_api;