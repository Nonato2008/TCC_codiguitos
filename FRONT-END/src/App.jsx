import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Painel from "./pages/Painel";
import Vendas from "./pages/Vendas";
import CadastroProdutos from "./pages/CadastroProduto";
import Fornecedores from "./pages/Fornecedor";
import CadastrarFornecedor from "./pages/CadastroFornecedor";
import GerenciamentoEstoque from "./pages/GerenciamentoEstoque";
import EntradaEstoque from "./pages/EntradaEstoque";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/Vendas" element={<Vendas />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/cadastroProdutos" element={<CadastroProdutos />} />
        <Route path="/fornecedores/cadastrar" element={<CadastrarFornecedor />} />
        <Route path="/gerenciamentoEstoque" element={<GerenciamentoEstoque />} />
        <Route path="/entradaEstoque" element={<EntradaEstoque />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
