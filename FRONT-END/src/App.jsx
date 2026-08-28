import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Painel from "./pages/Painel";
import CadastroProdutos from "./pages/CadastroProduto";
import GerenciamentoEstoque from "./pages/GerenciamentoEstoque";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/cadastroProdutos" element={<CadastroProdutos />} />
        <Route path="/gerenciamentoEstoque" element={<GerenciamentoEstoque />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
