
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { criarFornecedor } from "../services/fornecedoresService";
import { formatErrorMessage } from "../utils/formatErrorMessage";
import { ThemeContext } from "../contexts/ThemeContext";

export default function CadastrarFornecedor() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [imagem, setImagem] = useState(null);

  // Estados de controle da requisição e feedback ao usuário
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validação: nome obrigatório
    if (!nome.trim()) {
      setError("Informe o nome do fornecedor.");
      return;
    }

    try {
      setLoading(true);

      // Usa FormData porque há upload de arquivo (imagem)
      const formData = new FormData();

      formData.append("nome", nome);

      // Só anexa a imagem se o usuário tiver selecionado uma
      if (imagem) {
        formData.append("imagem", imagem);
      }

      // Chama a API para criar o fornecedor
      await criarFornecedor(formData);

      // Sucesso: limpa o formulário
      setSuccess("Fornecedor cadastrado com sucesso!");
      setNome("");
      setImagem(null);

      // Reseta manualmente o input de arquivo (não é controlado por state)
      const fileInput = document.getElementById("imagem");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      // Trata erros retornados pela API ou de conexão
      console.error("Erro ao cadastrar fornecedor:", error);

      setError(
        formatErrorMessage(
          error,
          "Não foi possível cadastrar o fornecedor. Verifique os dados e tente novamente.",
        ),
      );
    } finally {
      // Sempre desativa o loading, independentemente do resultado
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.layout, ...(isDark ? styles.layoutDark : {}) }}>
      <Sidebar />

      <main style={{ ...styles.page, ...(isDark ? styles.pageDark : {}) }}>
        <header style={styles.header}>
          <div>
            <h2
              style={{ ...styles.title, ...(isDark ? styles.titleDark : {}) }}
            >
              Cadastrar fornecedor
            </h2>

            <p
              style={{
                ...styles.subtitle,
                ...(isDark ? styles.subtitleDark : {}),
              }}
            >
              Cadastre um novo fornecedor para a loja.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.voltarButton,
              ...(isDark ? styles.voltarButtonDark : {}),
            }}
            onClick={() => navigate("/fornecedores")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar
          </button>
        </header>

        <section
          style={{ ...styles.formCard, ...(isDark ? styles.formCardDark : {}) }}
        >
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label
                style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}
              >
                Nome do fornecedor
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Digite o nome do fornecedor"
                style={{ ...styles.input, ...(isDark ? styles.inputDark : {}) }}
              />
            </div>

            <div style={styles.formGroup}>
              <label
                style={{ ...styles.label, ...(isDark ? styles.labelDark : {}) }}
              >
                Imagem do fornecedor
              </label>

              <input
                id="imagem"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImagem(e.target.files[0]);
                  setError("");
                  setSuccess("");
                }}
                style={{
                  ...styles.fileInput,
                  ...(isDark ? styles.fileInputDark : {}),
                }}
              />

              {imagem && (
                <div
                  style={{
                    ...styles.fileInfo,
                    ...(isDark ? styles.fileInfoDark : {}),
                  }}
                >
                  <span className="material-symbols-outlined">image</span>

                  <span>{imagem.name}</span>
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  ...styles.errorBox,
                  ...(isDark ? styles.errorBoxDark : {}),
                }}
              >
                <span className="material-symbols-outlined">error</span>

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
                  ...styles.successBox,
                  ...(isDark ? styles.successBoxDark : {}),
                }}
              >
                <span className="material-symbols-outlined">check_circle</span>

                <span>{success}</span>
              </div>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                style={{
                  ...styles.cancelButton,
                  ...(isDark ? styles.cancelButtonDark : {}),
                }}
                onClick={() => navigate("/fornecedores")}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={{
                  ...styles.saveButton,
                  ...(loading ? styles.disabledButton : {}),
                  ...(isDark ? styles.saveButtonDark : {}),
                }}
                disabled={loading}
              >
                <span className="material-symbols-outlined">
                  {loading ? "progress_activity" : "save"}
                </span>

                {loading ? "Cadastrando..." : "Cadastrar fornecedor"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "var(--surface)",
  },

  layoutDark: {
    backgroundColor: "var(--app-background)",
  },

  page: {
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px 32px 40px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
  },

  pageDark: {
    backgroundColor: "var(--surface)",
    color: "#f3f4f6",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
  },

  title: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: "32px",
    fontWeight: "700",
    margin: 0,
    color: "#111c2d",
  },

  titleDark: {
    color: "#f9fafb",
  },

  subtitle: {
    color: "#44474c",
    marginTop: "5px",
    marginBottom: 0,
  },

  subtitleDark: {
    color: "#d1d5db",
  },

  voltarButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
    color: "#303e51",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },

  voltarButtonDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  formCard: {
    maxWidth: "700px",
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    padding: "30px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },

  formCardDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#303e51",
  },

  labelDark: {
    color: "#e5e7eb",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #cfd5df",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
    color: "#111c2d",
    fontSize: "14px",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  },

  inputDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  fileInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px dashed #b8c0cc",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },

  fileInputDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#44474c",
    fontSize: "13px",
    padding: "10px",
    backgroundColor: "var(--surface-muted)",
    borderRadius: "6px",
  },

  fileInfoDark: {
    backgroundColor: "var(--surface)",
    color: "#d1d5db",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    marginBottom: "20px",
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    color: "#9f1239",
    fontSize: "14px",
    fontWeight: "600",
  },

  errorBoxDark: {
    backgroundColor: "#3f1721",
    borderColor: "#7f1d1d",
    color: "#fecdd3",
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    marginBottom: "20px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    color: "#047857",
    fontSize: "14px",
    fontWeight: "600",
  },

  successBoxDark: {
    backgroundColor: "#052e16",
    borderColor: "#14532d",
    color: "#bbf7d0",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "10px",
    borderTop: "1px solid var(--border-color)",
  },

  cancelButton: {
    padding: "11px 18px",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    backgroundColor: "var(--surface)",
    color: "#44474c",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },

  cancelButtonDark: {
    backgroundColor: "var(--surface)",
    borderColor: "var(--border-color)",
    color: "#f9fafb",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "var(--accent-color)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  },

  saveButtonDark: {
    backgroundColor: "var(--accent-color)",
  },
  
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};