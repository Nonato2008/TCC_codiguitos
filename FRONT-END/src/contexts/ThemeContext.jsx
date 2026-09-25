import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Lê o tema salvo (ou usa "light" como padrão)
    return localStorage.getItem("theme") || "light";
  });

  // Aplica a classe no <body> sempre que o tema mudar
  useEffect(() => {
    const body = document.body;

    body.classList.remove("light", "dark");
    body.classList.add(theme);

    // Salva no localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Função que o Sidebar espera
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,   // ← agora existe
      isDark: theme === "dark",
    }),
    [theme]
  );

  return (  
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}