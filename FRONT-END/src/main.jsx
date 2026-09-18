/*
  Entry: main.jsx
  - Ponto de entrada da aplicação React; monta `<App />` em `#root`.
  - Importa estilos globais (Bootstrap, index.css, App.css).
*/
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";


ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
