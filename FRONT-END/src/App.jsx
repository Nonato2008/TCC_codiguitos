
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import Painel from "./pages/Painel";
import Vendas from "./pages/Vendas";
import Produtos from "./pages/Produtos";
import CadastroVendas from "./pages/CadastroVenda";
import CadastroProdutos from "./pages/CadastroProduto";
import Fornecedores from "./pages/Fornecedor";
import CadastrarFornecedor from "./pages/CadastroFornecedor";
import GerenciamentoEstoque from "./pages/GerenciamentoEstoque";
import ProfileVenda from "./pages/ProfileVenda";
import ProfileProduto from "./pages/ProfileProduto";

import { ThemeProvider } from "./contexts/ThemeContext";
import { isLoggedIn } from "./services/authService.js";

function PrivateRoute() {
    return isLoggedIn()
        ? <Outlet />
        : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />

                    <Route element={<PrivateRoute />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/painel" element={<Painel />} />

                        <Route path="/vendas" element={<Vendas />} />
                        <Route path="/Vendas" element={<Vendas />} />

                        <Route path="/vendas/cadastrar" element={<CadastroVendas />} />
                        <Route path="/vendas/:id" element={<ProfileVenda />} />

                        <Route path="/produtos" element={<Produtos />} />
                        <Route path="/produtos/cadastrar" element={<CadastroProdutos />} />
                        <Route path="/produtos/:id" element={<ProfileProduto />} />

                        <Route path="/fornecedores" element={<Fornecedores />} />
                        <Route path="/cadastroProdutos" element={<CadastroProdutos />} />
                        <Route path="/fornecedores/cadastrar" element={<CadastrarFornecedor />} />
                        <Route path="/gerenciamentoEstoque" element={<GerenciamentoEstoque />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
