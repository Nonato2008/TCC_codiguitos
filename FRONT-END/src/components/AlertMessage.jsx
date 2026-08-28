export default function AlertMessage({ type = "success", message }) {
  if (!message) return null;

  return (
    <div
      style={{
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
  success: {
    backgroundColor: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  error: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
};
