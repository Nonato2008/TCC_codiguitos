import React from "react";
import { NavLink, useNavigate } from "react-router-dom";


const menu = [
    {
        nome: "Painel",
        icone: "dashboard",
        rota: "/painel"
    },
     {
        nome: "Fornecedores",
        icone: "local_shipping",
        rota: "/fornecedores"
    }
    
];


export default function Sidebar() {

    const navigate = useNavigate();

    function sair() {
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


            <nav style={styles.navigation}>

                {menu.map((item) => (
                    <NavLink
                        key={item.rota}
                        to={item.rota}
                        style={({ isActive }) => ({
                            ...styles.menuItem,
                            ...(isActive ? styles.menuItemActive : {})
                        })}
                    >
                        <span className="material-symbols-outlined">
                            {item.icone}
                        </span>

                        <span>{item.nome}</span>
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
        zIndex: 100
    },

    logoContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "32px"
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
        fontWeight: "600"
    },

    menuItemActive: {
        backgroundColor: "#303e51",
        color: "#ffffff"
    },

    newSale: {
        width: "100%",
        border: "none",
        backgroundColor: "#303e51",
        color: "#ffffff",
        padding: "12px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: "16px"
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
        cursor: "pointer"
    }
};
