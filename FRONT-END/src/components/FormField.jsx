export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  step,
  accept,
  dark = false,
  // Rest operator (não confundir com spread): junta todas as props que NÃO foram explicitamente listadas acima (ex: required, disabled, maxLength...) dentro de um objeto "rest". Isso permite passar props extras pro <input> sem precisar declarar cada uma manualmente na assinatura do componente.
  
  ...rest
}) {
  return (
    <label style={{ ...styles.field, ...(dark ? styles.fieldDark : {}) }}>
      <span style={{ ...styles.label, ...(dark ? styles.labelDark : {}) }}>{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        accept={accept}
        style={{ ...styles.input, ...(dark ? styles.inputDark : {}) }}
        // Spread operator: espalha as props extras capturadas no "rest" direto no input (ex: se o pai passar required, cai aqui automaticamente)
        {...rest}
      />
    </label>
  );
}

// Estilos compartilhados por todos os campos do formulário que usam esse componente
const styles = {
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldDark: {
    color: "#e5e7eb",
  },
  label: {
    fontWeight: 600,
    color: "#303e51",
  },
  labelDark: {
    color: "#e5e7eb",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7dfeb",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  inputDark: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
};