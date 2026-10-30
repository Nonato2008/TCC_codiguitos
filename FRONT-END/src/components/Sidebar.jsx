
import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

const menu = [
    {
        nome: "Painel",
        icone: "dashboard",
        rota: "/painel",
        acesso: ["PROPRIETARIO"]
    },
    {
        nome: "Vendas",
        icone: "point_of_sale",
        rota: "/vendas",
        acesso: ["PROPRIETARIO", "VENDEDOR"]
    },
    {
        nome: "Gerenciamento de Estoque",
        icone: "inventory",
        rota: "/gerenciamentoEstoque",
        acesso: ["PROPRIETARIO", "VENDEDOR"]
    },
    {
        nome: "Produtos",
        icone: "inventory_2",
        rota: "/produtos",
        acesso: ["PROPRIETARIO"]
    },
    {
        nome: "Fornecedores",
        icone: "business",
        rota: "/fornecedores",
        acesso: ["PROPRIETARIO"]
    }
];

export default function Sidebar() {
    const navigate = useNavigate();

    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const [mostrarSegredo, setMostrarSegredo] = useState(false);
    const [mostrarLista, setMostrarLista] = useState(false);

    const [easterEggsEncontrados, setEasterEggsEncontrados] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("easterEggsEncontrados") || "[]");
        } catch {
            return [];
        }
    });

    const cliquesLogo = useRef(0);

    const listaEasterEggs = [
        { id: 1, nome: "Segredo da Logo do Nelson" },
        { id: 2, nome: "Segredo das Vendas" },
        { id: 3, nome: "Segredo dos Produtos" },
        { id: 4, nome: "Segredo dos Fornecedores" },
        { id: 5, nome: "Segredo do Foguinho" }
    ];

    function atualizarEasterEgg(id) {
        let encontrados = [];

        try {
            encontrados = JSON.parse(
                localStorage.getItem("easterEggsEncontrados") || "[]"
            );
        } catch {
            encontrados = [];
        }

        if (!encontrados.includes(id)) {
            encontrados.push(id);

            localStorage.setItem(
                "easterEggsEncontrados",
                JSON.stringify(encontrados)
            );

            window.dispatchEvent(
                new CustomEvent("easterEggDesbloqueado", {
                    detail: { id }
                })
            );
        }

        setEasterEggsEncontrados(encontrados);
    }

    function clicarLogo() {
        cliquesLogo.current += 1;

        if (cliquesLogo.current === 5) {
            setMostrarSegredo(true);
            cliquesLogo.current = 0;
            atualizarEasterEgg(1);
        }
    }

    useEffect(() => {
        let digitado = "";

        function detectarCodigo(event) {
            if (
                event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA" ||
                event.target.isContentEditable
            ) {
                return;
            }

            if (event.key.length === 1) {
                digitado += event.key.toUpperCase();

                if (digitado.length > 6) {
                    digitado = digitado.slice(-6);
                }

                if (digitado === "NELSON") {
                    try {
                        const encontrados = JSON.parse(
                            localStorage.getItem("easterEggsEncontrados") || "[]"
                        );

                        setEasterEggsEncontrados(encontrados);
                    } catch {
                        setEasterEggsEncontrados([]);
                    }

                    setMostrarLista(true);
                    digitado = "";
                }
            } else if (event.key === "Backspace") {
                digitado = digitado.slice(0, -1);
            }
        }

        window.addEventListener("keydown", detectarCodigo);

        return () => {
            window.removeEventListener("keydown", detectarCodigo);
        };
    }, []);

    const usuarioSalvo = localStorage.getItem("usuario");

    let usuario = null;

    try {
        usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch {
        usuario = null;
    }

    const nomeUsuario =
        usuario?.nome ||
        usuario?.Nome ||
        "Usuário";

    const perfilOriginal =
        usuario?.perfil ||
        usuario?.Perfil ||
        usuario?.tipo ||
        usuario?.Tipo ||
        usuario?.role ||
        usuario?.Role ||
        "VENDEDOR";

    const perfilNormalizado = String(perfilOriginal)
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const perfilUsuario =
        perfilNormalizado === "PROPRIETARIO"
            ? "Proprietário"
            : "Vendedor";

    const menuPermitido = menu.filter((item) =>
        item.acesso.includes(perfilNormalizado)
    );

    function sair() {
        localStorage.removeItem("usuario");
        navigate("/login");
    }

    return (
        <aside
            style={{
                ...styles.sidebar,
                ...(isDark ? styles.sidebarDark : {})
            }}
        >
            <div style={styles.logoContainer}>
                <div
                    style={{
                        ...styles.logo,
                        ...(isDark ? styles.logoDark : {})
                    }}
                >
                    <img
                        src="/logo.png"
                        alt="Adega do Nelson"
                        style={{
                            ...styles.logoImage,
                            cursor: "pointer"
                        }}
                        onClick={clicarLogo}
                    />
                </div>

                <div>
                    <h1
                        style={{
                            ...styles.logoTitle,
                            ...(isDark ? styles.logoTitleDark : {})
                        }}
                    >
                        Adega do Nelson
                    </h1>

                    <p
                        style={{
                            ...styles.logoSubtitle,
                            ...(isDark ? styles.logoSubtitleDark : {})
                        }}
                    >
                        Melhores Bebidas
                    </p>
                </div>
            </div>

            <div
                style={{
                    ...styles.usuarioContainer,
                    ...(isDark ? styles.usuarioContainerDark : {})
                }}
            >
                <div
                    style={{
                        ...styles.usuarioIcon,
                        ...(isDark ? styles.usuarioIconDark : {})
                    }}
                >
                    <span className="material-symbols-outlined">
                        person
                    </span>
                </div>

                <div style={styles.usuarioInfo}>
                    <span
                        style={{
                            ...styles.usuarioNome,
                            ...(isDark ? styles.usuarioNomeDark : {})
                        }}
                    >
                        {nomeUsuario}
                    </span>

                    <span
                        style={{
                            ...styles.usuarioPerfil,
                            ...(isDark ? styles.usuarioPerfilDark : {})
                        }}
                    >
                        {perfilUsuario}
                    </span>
                </div>
            </div>

            <nav style={styles.navigation}>
                {menuPermitido.map((item) => (
                    <NavLink
                        key={item.rota}
                        to={item.rota}
                        style={({ isActive }) => ({
                            ...styles.menuItem,
                            ...(isDark ? styles.menuItemDark : {}),
                            ...(isActive ? styles.menuItemActive : {}),
                            ...(isActive && isDark
                                ? styles.menuItemActiveDark
                                : {})
                        })}
                    >
                        <span className="material-symbols-outlined">
                            {item.icone}
                        </span>

                        <span>{item.nome}</span>
                    </NavLink>
                ))}
            </nav>

            <div
                style={{
                    ...styles.bottomMenu,
                    ...(isDark ? styles.bottomMenuDark : {})
                }}
            >
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
                    style={{
                        ...styles.bottomItem,
                        ...(isDark ? styles.bottomItemDark : {})
                    }}
                    onClick={sair}
                >
                    <span className="material-symbols-outlined">
                        logout
                    </span>

                    Sair
                </button>
            </div>

            {mostrarSegredo && (
                <div
                    style={styles.secretOverlay}
                    onClick={() => setMostrarSegredo(false)}
                >
                    <div
                        style={{
                            ...styles.secretCard,
                            ...(isDark ? styles.secretCardDark : {})
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src="/miguel-henri.png"
                            alt="Miguel Henri - O Filho do Dono"
                            style={styles.secretImage}
                        />

                        <h3
                            style={{
                                ...styles.secretTitle,
                                ...(isDark ? styles.secretTitleDark : {})
                            }}
                        >
                            Easter Eggs Do Nelson
                        </h3>

                        <p
                            style={{
                                ...styles.secretText,
                                ...(isDark ? styles.secretTextDark : {})
                            }}
                        >
                            Parabéns! Você encontrou Miguel Henri!!!
                        </p>

                        <button
                            type="button"
                            style={styles.secretButton}
                            onClick={() => setMostrarSegredo(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {mostrarLista && (
                <div
                    style={styles.secretOverlay}
                    onClick={() => setMostrarLista(false)}
                >
                    <div
                        style={{
                            ...styles.secretCard,
                            ...(isDark ? styles.secretCardDark : {})
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2
                            style={{
                                ...styles.secretTitle,
                                ...(isDark ? styles.secretTitleDark : {})
                            }}
                        >
                            Easter Eggs da Adega
                        </h2>

                        <p
                            style={{
                                ...styles.secretText,
                                ...(isDark ? styles.secretTextDark : {})
                            }}
                        >
                            Descubra todos os segredos escondidos no sistema!
                        </p>

                        {listaEasterEggs.map((egg) => {
                            const encontrado =
                                easterEggsEncontrados.includes(egg.id);

                            return (
                                <div
                                    key={egg.id}
                                    style={{
                                        ...styles.eggItem,
                                        ...(isDark ? styles.eggItemDark : {})
                                    }}
                                >
                                    <span>{egg.nome}</span>

                                    <strong
                                        style={{
                                            color: encontrado
                                                ? "#16a34a"
                                                : "#dc2626"
                                        }}
                                    >
                                        {encontrado
                                            ? "ENCONTRADO"
                                            : "BLOQUEADO"}
                                    </strong>
                                </div>
                            );
                        })}

                        <button
                            type="button"
                            style={styles.secretButton}
                            onClick={() => setMostrarLista(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
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
        transition: "background-color 0.3s ease, border-color 0.3s ease",
        boxSizing: "border-box"
    },

    sidebarDark: {
        backgroundColor: "#111827",
        borderRight: "1px solid #374151"
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

    logoDark: {
        borderColor: "#4b5563"
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

    usuarioContainer: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        marginBottom: "20px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        transition: "all 0.3s ease"
    },

    usuarioContainerDark: {
        backgroundColor: "#1f2937",
        borderColor: "#374151"
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

    usuarioIconDark: {
        backgroundColor: "#374151"
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

    usuarioNomeDark: {
        color: "#f9fafb"
    },

    usuarioPerfil: {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px"
    },

    usuarioPerfilDark: {
        color: "#cbd5e1"
    },

    navigation: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flex: 1,
        overflowY: "auto"
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

    menuItemDark: {
        color: "#e5e7eb"
    },

    menuItemActive: {
        backgroundColor: "#303e51",
        color: "#ffffff"
    },

    menuItemActiveDark: {
        backgroundColor: "#1f2937",
        color: "#f9fafb"
    },

    bottomMenu: {
        borderTop: "1px solid #e2e8f0",
        paddingTop: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },

    bottomMenuDark: {
        borderTopColor: "#374151"
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
    },

    secretOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px"
    },

    secretCard: {
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        padding: "24px",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        boxSizing: "border-box"
    },

    secretCardDark: {
        backgroundColor: "#111827"
    },

    secretImage: {
        width: "100%",
        maxHeight: "300px",
        objectFit: "contain",
        borderRadius: "10px",
        marginBottom: "18px"
    },

    secretTitle: {
        margin: 0,
        fontSize: "24px",
        color: "#111827"
    },

    secretTitleDark: {
        color: "#f9fafb"
    },

    secretText: {
        margin: "12px 0 20px",
        color: "#4b5563"
    },

    secretTextDark: {
        color: "#d1d5db"
    },

    secretButton: {
        border: "none",
        borderRadius: "10px",
        backgroundColor: "#303e51",
        color: "#ffffff",
        padding: "12px 24px",
        fontWeight: "700",
        cursor: "pointer"
    },

    eggItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        marginBottom: "8px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        color: "#111827",
        fontSize: "13px",
        textAlign: "left"
    },

    eggItemDark: {
        borderColor: "#374151",
        color: "#f9fafb"
    }
};
