export default function PrimaryButton({ children, disabled = false, type = "submit" }) {
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
