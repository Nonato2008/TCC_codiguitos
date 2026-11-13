import { useEffect, useRef } from "react";

export default function ConfirmacaoExclusao({
  open,
  nome,
  titulo = "Excluir item",
  mensagem,
  onConfirm,
  onCancel,
  confirmarLabel = "Excluir",
}) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      style={styles.overlay}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacao-exclusao-titulo"
        style={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirmacao-exclusao-titulo" style={styles.title}>
          {titulo}
        </h3>

        <p style={styles.text}>
          {mensagem || `Deseja realmente excluir "${nome}"?`}
        </p>

        <div style={styles.actions}>
          <button
            ref={cancelButtonRef}
            type="button"
            style={styles.cancelButton}
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            style={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 2000,
  },
  modal: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.25)",
    padding: "24px 20px 18px",
    boxSizing: "border-box",
    border: "1px solid #e2e8f0",
  },
  title: {
    margin: "0 0 10px",
    color: "#111827",
    fontSize: "22px",
    fontWeight: 700,
  },
  text: {
    margin: "0 0 18px",
    color: "#475569",
    fontSize: "16px",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "18px",
  },
  cancelButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    cursor: "pointer",
    fontWeight: 600,
  },
  confirmButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
};
