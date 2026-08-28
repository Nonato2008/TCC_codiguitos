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
        {...rest}
      />
    </label>
  );
}

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
