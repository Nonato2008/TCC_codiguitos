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
  // Rest operator (não confundir com spread): junta todas as props que NÃO foram explicitamente listadas acima (ex: required, disabled, maxLength...) dentro de um objeto "rest". Isso permite passar props extras pro <input> sem precisar declarar cada uma manualmente na assinatura do componente.
  
  ...rest
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        accept={accept}
        style={styles.input}
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
  label: {
    fontWeight: 600,
    color: "#303e51",
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
  },
};