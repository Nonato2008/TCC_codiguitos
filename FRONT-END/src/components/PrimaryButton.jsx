export default function PrimaryButton({
  children, // conteúdo dentro do botão (texto, ícone, etc.) — o que vier entre <PrimaryButton>...</PrimaryButton>
  disabled = false, // desabilita o botão (ex: enquanto uma requisição está em andamento)
  type = "submit", // "submit" por padrão pq esse botão normalmente é usado dentro de formulários
}) {
  return (
    <button type={type} style={styles.primaryButton} disabled={disabled}>
      {children}
    </button>
  );
}

const styles = {
  primaryButton: {
    border: "none",
    backgroundColor: "#303e51", 
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
};