import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useVendas } from "../hooks/useVendas";
import { buscarVendedores } from "../services/vendedoresService";
import VendasList from "../components/VendasList";

export default function Vendas() {
    const { vendas, loading, error } = useVendas();

    const [vendedores, setVendedores] = useState([]);

    useEffect(() => {
        const carregarVendedores = async () => {
            try {
                const dados = await buscarVendedores();
                setVendedores(dados);
            } catch (error) {
                console.error("Erro ao buscar vendedores:", error);
            }
        };

        carregarVendedores();
    }, []);

    const encontrarNomeVendedor = (idVendedor) => {
        const vendedor = vendedores.find(
            (vendedor) => vendedor.Id === idVendedor
        );

        return vendedor
            ? vendedor.Nome
            : `Vendedor #${idVendedor}`;
    };

    if (loading) {
        return (
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>
                    <div style={styles.centerContent}>
                        <p>Carregando vendas...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.layout}>
                <Sidebar />

                <main style={styles.page}>
                    <div style={styles.centerContent}>
                        <div style={styles.error}>
                            Erro ao carregar as vendas.
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const vendasComVendedor = vendas.map((venda) => ({
        ...venda,
        NomeVendedor: encontrarNomeVendedor(venda.IdVendedor),
    }));

    import { Link } from "react-router-dom";

return (
    <div style={styles.layout}>

        <Sidebar />

        <main style={styles.page}>

            {/* CABEÇALHO */}
            <header style={styles.header}>

                <div>
                    <h1 style={styles.title}>
                        Vendas
                    </h1>

                    <p style={styles.subtitle}>
                        Consulte as vendas realizadas na loja.
                    </p>
                </div>

                <div style={styles.total}>
                    {vendas.length}{" "}
                    {vendas.length === 1
                        ? "venda"
                        : "vendas"}
                </div>

            </header>

            {/* BOTÃO NOVA VENDA */}
            <div style={styles.newSaleContainer}>

                <Link
                    to="/vendas/cadastrar"
                    style={{ textDecoration: "none" }}
                >
                    <button style={styles.primaryButton}>
                        + Nova venda
                    </button>
                </Link>

            </div>

            {/* LISTA */}
            <section style={styles.content}>

                {vendas.length === 0 ? (

                    <div style={styles.empty}>
                        <span className="material-symbols-outlined">
                            point_of_sale
                        </span>

                        <p>
                            Nenhuma venda encontrada.
                        </p>
                    </div>

                ) : (

                    <VendasList
                        vendas={vendasComVendedor}
                    />

                )}

            </section>

        </main>

    </div>
)};
    

const styles = {

    layout: {
        minHeight: "100vh",
        backgroundColor: "#f5f6f8",
    },

    page: {
        marginLeft: "363px",
        minHeight: "100vh",
        padding: "30px 25px",
        boxSizing: "border-box",
    },

    header: {
        maxWidth: "1150px",
        margin: "0 0 25px 0",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        margin: 0,
        fontSize: "32px",
        fontWeight: "700",
        color: "#243447",
    },

    subtitle: {
        marginTop: "7px",
        marginBottom: 0,
        fontSize: "15px",
        color: "#718096",
    },

    total: {
        backgroundColor: "#ffffff",
        padding: "10px 18px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        color: "#243447",
        fontWeight: "600",
        fontSize: "15px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
    },

    content: {
        width: "100%",
        maxWidth: "1150px",
        margin: "0",
    },

    centerContent: {
        maxWidth: "1150px",
        margin: "0",
    },

    empty: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "50px",
        textAlign: "center",
        color: "#718096",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    },

    error: {
        backgroundColor: "#ffe5e5",
        color: "#b00020",
        padding: "20px",
        borderRadius: "10px",
    },
};