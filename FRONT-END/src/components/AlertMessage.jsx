// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣤⣄⣾
// ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⢿⣿⣿
// ⠀⠀⠀⠀⠀⠀⢰⣦⠀⠀⠀⣽⢿⣵⣿⡟
// ⠀⠀⠀⠀⠀⣀⣀⣽⣷⣖⡤⣵⣿⣧⣭⠁
// ⢀⡤⢦⣄⡈⠛⠈⠛⠋⠉⠋⠻⣿⣿⡿⣧⣀⠀⠀⠀⠀⠀
// ⣾⠁⠀⠘⣷⣄⠀⠀⠀⠀⠀⠀⠙⣿⣿⡄⠉⠻⣦⠀⠀⠀
// ⢹⡄⠀⠀⠘⣿⣦⡀⠀⠀⠀⣠⣾⣿⢯⣯⣤⡀⠈⣷⣄⠀
// ⠈⢷⡄⠀⠀⠸⣿⣿⣦⣤⣼⣿⣿⣿⢾⣿⣿⣷⠈⠇⡹⡦
// ⠀⠈⢿⣷⣄⡀⠘⢿⣿⡇⣿⣿⣿⣿⣿⣿⣿⡿
// ⠀⠀⠀⠹⣿⣿⡄⠀⠙⢣⣿⠿⠿⠟⠛⣿⠟⠁⠀
// ⠀⠀⠀⠀⠀⠉⠀⠀⣠⡿⠃⠀⠀⠀⢠⣿⠀
// ⠀⠀⠀⠀⠀⠀⠀⢠⣿⡃⠀⠀⠀⠀⠶⠻⣷⣄⣀⢀⠀⠀
// ⠀⠀⠀⠀⠀⠀⣰⣿⡿⣿⠀⠀⠀⠀⠀⠀⠈⠉⠉⠀
//⠀⠀⠀⠀⠀ ⠀⠉

export default function AlertMessage({ type = "success", message }) {
  if (!message) return null;

  return (
    <div
      style={{

        // (...) = spread operator: copia todas as propriedades do objeto para cá.
        // Aqui juntamos duas fontes num objeto de estilo só: o estilo base (styles.alert)
        // e o estilo condicional (styles.success ou styles.error, conforme o "type").
        ...styles.alert, 
        ...(type === "success" ? styles.success : styles.error),
      }}
    >
      {message}
    </div>
  );
}

const styles = {
  alert: {
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontWeight: 500,
  },
  // Sobrescreve cor de fundo, texto e borda para o caso de sucesso (verde)
  success: {
    backgroundColor: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  // Sobrescreve cor de fundo, texto e borda para o caso de erro (vermelho)
  error: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
};