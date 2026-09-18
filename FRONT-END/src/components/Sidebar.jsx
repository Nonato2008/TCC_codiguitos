import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

// Lista de itens do menu lateral.
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
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    // Função chamada ao clicar em "Sair": redireciona o usuário para a tela de login
    function sair() {
        navigate("/login");
    }

    return (
        <aside style={{ ...styles.sidebar, ...(isDark ? styles.sidebarDark : {}) }}>

            {/* Cabeçalho da sidebar: logo + nome do sistema */}
            <div style={styles.logoContainer}>
                <div style={{ ...styles.logo, ...(isDark ? styles.logoDark : {}) }}>
                    <img
                        src="/logo.png"
                        alt="Adega do Nelson"
                        style={styles.logoImage}
                    />
                </div>

                <div>
                    <h1 style={{ ...styles.logoTitle, ...(isDark ? styles.logoTitleDark : {}) }}>
                        Adega do Nelson
                    </h1>

                    <p style={{ ...styles.logoSubtitle, ...(isDark ? styles.logoSubtitleDark : {}) }}>
                        Melhores Bebidas
                    </p>
                </div>
            </div>

            {/* Menu de navegação principal, gerado dinamicamente a partir do array "menu" */}
            <nav style={styles.navigation}>

                {menu.map((item) => (
                    <NavLink
                        key={item.rota} 
                        to={item.rota}
                        // NavLink permite estilizar condicionalmente o item ativo (rota atual)
                        style={({ isActive }) => ({
                            ...styles.menuItem,
                            ...(isDark ? styles.menuItemDark : {}),
                            ...(isActive ? styles.menuItemActive : {}),
                            ...(isActive && isDark ? styles.menuItemActiveDark : {})
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
                    onClick={toggleTheme}
                    style={{
                        ...styles.themeButton,
                        ...(isDark ? styles.themeButtonDark : {})
                    }}
                >
                    <span className="material-symbols-outlined">
                        {isDark ? "light_mode" : "dark_mode"}
                    </span>
                    {isDark ? "Modo claro" : "Modo escuro"}
                </button>

                <button
                    type="button"
                    style={{ ...styles.bottomItem, ...(isDark ? styles.bottomItemDark : {}) }}
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

// Objeto com todos os estilos inline do componente (padrão CSS-in-JS via style prop)
const styles = {

    // Container principal: fixo na tela, ocupando a altura total (sidebar fixa à esquerda)
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
        transition: "background-color 0.3s ease, border-color 0.3s ease"
    },

    sidebarDark: {
        backgroundColor: "#111827",
        borderRight: "1px solid #374151"
    },

    // Área do topo com logo + título/subtítulo, alinhados lado a lado
    logoContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "32px"
    },

    // Caixa que envolve a imagem do logo (controla tamanho e cantos arredondados)
    logo: {
        width: "48px",
        height: "48px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        flexShrink: 0
    },

    logoDark: {
        borderColor: "#4b5563"
    },

    // Faz a imagem preencher a caixa do logo sem distorcer
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

    logoTitleDark: {
        color: "#f9fafb"
    },

    logoSubtitle: {
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        color: "#44474c",
        margin: "2px 0 0"
    },

    logoSubtitleDark: {
        color: "#d1d5db"
    },

    // Container do menu: cresce para ocupar o espaço disponível (empurra o rodapé para baixo)
    navigation: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flex: 1
    },

    // Estilo padrão de cada item do menu (link)
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

    menuItemDark: {
        color: "#e5e7eb"
    },

    // Estilo aplicado por cima do menuItem quando a rota está ativa (mesclado via spread no NavLink)
    menuItemActive: {
        backgroundColor: "#303e51",
        color: "#ffffff"
    },

    menuItemActiveDark: {
        backgroundColor: "#1f2937",
        color: "#f9fafb"
    },

    // Área inferior fixa, separada do menu por uma linha divisória
    bottomMenu: {
        borderTop: "1px solid #e2e8f0",
        paddingTop: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },

    themeButton: {
        width: "100%",
        border: "1px solid #d1d5db",
        backgroundColor: "#ffffff",
        color: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 12px",
        borderRadius: "10px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },

    themeButtonDark: {
        backgroundColor: "#1f2937",
        borderColor: "#4b5563",
        color: "#f9fafb"
    },

    // Estilo do botão "Sair" (visualmente parecido com os itens do menu, mas é um <button>)
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
    },

    bottomItemDark: {
        color: "#e5e7eb"
    }
};