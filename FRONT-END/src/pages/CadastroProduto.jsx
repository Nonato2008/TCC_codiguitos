import React from "react";
import Sidebar from "../components/Sidebar";
import { useProdutos } from "../hooks/useProdutos";

export default function CadastroProdutos() {
    const { produtos, setProdutos } = useProdutos();
}

return (
    <div style={styles.layout}>
        <Sidebar />

        <main style={styles.page}>
            <header style={styles.header}>
                <h2 style={styles.title}>Cadastro de Produtos</h2>
                <p style={styles.subtitle}>Adicione novos produtos ao seu estoque.</p>
            </header>
    </div>
)