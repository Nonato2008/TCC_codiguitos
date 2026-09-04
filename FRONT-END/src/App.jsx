import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Painel from "./pages/Painel.jsx";
import CadastroProdutos from "./pages/CadastroProduto.jsx";
import Fornecedores from "./pages/Fornecedor.jsx";
import CadastrarFornecedor from "./pages/CadastroFornecedor.jsx";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/cadastroProdutos" element={<CadastroProdutos />} />
        <Route path="/fornecedores/cadastrar" element={<CadastrarFornecedor />} />
        <Route path="/gerenciamentoEstoque" element={<GerenciamentoEstoque />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
