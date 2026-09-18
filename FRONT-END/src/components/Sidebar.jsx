import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const menu = [
    {
        nome: "Painel",
        icone: "dashboard",
        rota: "/painel"
    },
    {
        nome: "Vendas",
        icone: "point_of_sale",
        rota: "/vendas"
    },
    {
        nome: "Gerenciamento de Estoque",
        icone: "inventory",
        rota: "/gerenciamentoEstoque"
    },
    {
        nome: "Cadastro de Produtos",
        icone: "inventory_2",
        rota: "/cadastroProdutos"
    },
    {
        nome: "Fornecedores",
        icone: "business",
        rota: "/fornecedores"
    }
];

export default function Sidebar() {

    const navigate = useNavigate();

    const usuarioSalvo =
        localStorage.getItem("usuario");

    let usuario = null;

    try {

        usuario =
            usuarioSalvo
                ? JSON.parse(usuarioSalvo)
                : null;

    } catch (error) {

        usuario = null;

    }

    const nomeUsuario =
        usuario?.nome ||
        usuario?.Nome ||
        "Usuário";

    const perfilUsuario =
        usuario?.perfil ||
        usuario?.tipo ||
        usuario?.role ||
        usuario?.Perfil ||
        "Usuário";

    function sair() {

        localStorage.removeItem("usuario");

        navigate("/login");
    }

    return (
        <aside style={styles.sidebar}>

            <div style={styles.logoContainer}>

                <div style={styles.logo}>

                    <img
                        src="/logo.png"
                        alt="Adega do Nelson"
                        style={styles.logoImage}
                    />

                </div>

                <div>

                    <h1 style={styles.logoTitle}>
                        Adega do Nelson
                    </h1>

                    <p style={styles.logoSubtitle}>
                        Melhores Bebidas
                    </p>

                </div>

            </div>

            <div style={styles.usuarioContainer}>

                <div style={styles.usuarioIcon}>

                    <span className="material-symbols-outlined">
                        person
                    </span>

                </div>

                <div style={styles.usuarioInfo}>

                    <span style={styles.usuarioNome}>
                        {nomeUsuario}
                    </span>

                    <span style={styles.usuarioPerfil}>
                        {perfilUsuario}
                    </span>

                </div>

            </div>

            <nav style={styles.navigation}>

                {menu.map((item) => (
                    <NavLink
                        key={item.rota}
                        to={item.rota}
                        style={({ isActive }) => ({
                            ...styles.menuItem,
                            ...(isActive
                                ? styles.menuItemActive
                                : {})
                        })}
                    >

                        <span className="material-symbols-outlined">
                            {item.icone}
                        </span>

                        <span>
                            {item.nome}
                        </span>

                    </NavLink>
                ))}

            </nav>

            <div style={styles.bottomMenu}>

                <button
                    type="button"
                    style={styles.bottomItem}
                    onClick={sair}
                >

                    <span className="material-symbols-outlined">
                        logout
                    </span>

                    Sair

                </button>

            </div>

        </aside>
    );
}

const styles = {

    sidebar: {
        position: "fixed",
        left: 0,
        top: 0,
        width: "256px",
        height: "100vh",
        backgroundColor: "#f9f9ff",
        borderRight: "1px solid #e2e8f0",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        boxSizing: "border-box"
    },

    logoContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px"
    },

    logo: {
        width: "48px",
        height: "48px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        flexShrink: 0
    },

    logoImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },

    logoTitle: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "18px",
        fontWeight: "700",
        color: "#303e51",
        margin: 0
    },

    logoSubtitle: {
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        color: "#44474c",
        margin: "2px 0 0"
    },

    usuarioContainer: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px",
        marginBottom: "24px",
        backgroundColor: "#eef1f6",
        borderRadius: "10px",
        border: "1px solid #e2e8f0"
    },

    usuarioIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        backgroundColor: "#303e51",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    },

    usuarioInfo: {
        display: "flex",
        flexDirection: "column",
        minWidth: 0
    },

    usuarioNome: {
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: "700",
        color: "#303e51",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },

    usuarioPerfil: {
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        color: "#64748b",
        marginTop: "2px"
    },

    navigation: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flex: 1
    },

    menuItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "10px",
        textDecoration: "none",
        color: "#44474c",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.3s ease",
        cursor: "pointer"
    },

    menuItemActive: {
        backgroundColor: "#303e51",
        color: "#ffffff"
    },

    bottomMenu: {
        borderTop: "1px solid #e2e8f0",
        paddingTop: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },

    bottomItem: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        borderRadius: "10px",
        color: "#44474c",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.3s ease"
    }
};
