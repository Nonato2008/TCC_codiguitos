
import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

function SistemaConquistas() {
    const [conquista, setConquista] = useState(null);
    const timer = useRef(null);

    useEffect(() => {
        function receberConquista(event) {
            const conquistas = {
                1: {
                    nome: "Segredo da Logo do Nelson",
                    descricao: "Você encontrou o primeiro segredo!"
                },
                2: {
                    nome: "Segredo das Vendas",
                    descricao: "Você descobriu o segredo das vendas!"
                },
                3: {
                    nome: "Segredo dos Produtos",
                    descricao: "Você descobriu o segredo dos produtos!"
                },
                4: {
                    nome: "Segredo dos Fornecedores",
                    descricao: "Você descobriu o segredo dos fornecedores!"
                },
                5: {
                    nome: "Segredo do Foguinho",
                    descricao: "Você encontrou um segredo especial!"
                }
            };

            const novaConquista = conquistas[event.detail?.id];

            if (!novaConquista) return;

            setConquista(novaConquista);

            if (timer.current) {
                clearTimeout(timer.current);
            }

            timer.current = setTimeout(() => {
                setConquista(null);
            }, 6000);
        }

        window.addEventListener("easterEggDesbloqueado", receberConquista);

        return () => {
            window.removeEventListener("easterEggDesbloqueado", receberConquista);

            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, []);

    if (!conquista) return null;

    return (
        <div style={styles.conquista}>
            <div style={styles.conquistaIcone}>
                <span className="material-symbols-outlined">
                    emoji_events
                </span>
            </div>

            <div style={styles.conquistaConteudo}>
                <strong style={styles.conquistaLabel}>
                    CONQUISTA DESBLOQUEADA
                </strong>

                <strong style={styles.conquistaNome}>
                    {conquista.nome}
                </strong>

                <span style={styles.conquistaDescricao}>
                    {conquista.descricao}
                </span>
            </div>

            <button
                type="button"
                style={styles.conquistaFechar}
                onClick={() => setConquista(null)}
            >
                ×
            </button>
        </div>
    );
}

const styles = {
    conquista: {
        position: "fixed",
        right: "25px",
        bottom: "25px",
        width: "350px",
        maxWidth: "calc(100vw - 40px)",
        backgroundColor: "#171a21",
        border: "1px solid #526174",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.4)",
        zIndex: 10000,
        boxSizing: "border-box",
        animation: "achievementSlideIn 0.4s ease"
    },

    conquistaIcone: {
        width: "52px",
        height: "52px",
        minWidth: "52px",
        borderRadius: "10px",
        backgroundColor: "#26384a",
        color: "#f3c969",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    conquistaConteudo: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        flex: 1
    },

    conquistaLabel: {
        color: "#a9b5c5",
        fontSize: "10px",
        letterSpacing: "1px"
    },

    conquistaNome: {
        color: "#ffffff",
        fontSize: "14px"
    },

    conquistaDescricao: {
        color: "#c4ccd6",
        fontSize: "12px"
    },

    conquistaFechar: {
        backgroundColor: "transparent",
        border: "none",
        color: "#a9b5c5",
        fontSize: "22px",
        cursor: "pointer",
        alignSelf: "flex-start"
    }
};

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <SistemaConquistas />

                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
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

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
