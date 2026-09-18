export function formatErrorMessage(error, fallback = "Ocorreu um erro inesperado.") {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error.trim() || fallback;
  }

  const status = Number(error?.response?.status ?? error?.status ?? 0);
  const payload = error.response?.data ?? error.data ?? error;
  const detalhes = [];

  const adicionar = (valor) => {
    if (typeof valor !== "string") return;

    const texto = valor.trim();
    if (!texto) return;

    if (!detalhes.includes(texto)) {
      detalhes.push(texto);
    }
  };

  const textoBruto = [
    payload?.message,
    payload?.errorMessage,
    payload?.error,
    payload?.details,
    error?.message,
    typeof payload === "string" ? payload : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    status === 401 ||
    textoBruto.includes("request failed with status code 401") ||
    textoBruto.includes("err_bad_request") ||
    textoBruto.includes("nome ou senha incorretos") ||
    textoBruto.includes("credenciais inválidas") ||
    textoBruto.includes("unauthorized") ||
    textoBruto.includes("invalid credentials")
  ) {
    return "Nome ou senha incorretos.";
  }

  // Erros de servidor ao inserir/processar dados (500 / ERR_BAD_RESPONSE / exceptions internas)
  if (
    status === 500 ||
    textoBruto.includes("request failed with status code 500") ||
    textoBruto.includes("err_bad_response") ||
    textoBruto.includes("cannot read properties of null") ||
    textoBruto.includes("cannot read properties of undefined") ||
    textoBruto.includes("toString()") ||
    textoBruto.includes("cannot read")
  ) {
    return "Erro ao inserir/processar o produto. Verifique os dados e tente novamente mais tarde.";
  }

  if (
    textoBruto.includes("nome deve possuir entre 3 e 45 caracteres") ||
    textoBruto.includes("o nome deve possuir entre")
  ) {
    return "O nome do produto deve ter entre 3 e 45 caracteres.";
  }

  if (
    textoBruto.includes("out of range value for column 'preco'") ||
    textoBruto.includes("out of range value for column \"preco\"") ||
    textoBruto.includes("preco excede o limite permitido") ||
    textoBruto.includes("valor até r$ 9.999.999,99")
  ) {
    return "Preço fora do limite permitido. Informe um valor até R$ 9.999.999,99 e verifique também o limite de 45 caracteres no nome do produto.";
  }

  if (
    textoBruto.includes("out of range value for column 'quantidade'") ||
    textoBruto.includes("out of range value for column \"quantidade\"") ||
    textoBruto.includes("quantidade excede o limite permitido") ||
    textoBruto.includes("999.999 unidades")
  ) {
    return "Quantidade fora do limite permitido. Informe uma quantidade até 999.999 unidades.";
  }

  if (payload && typeof payload === "object") {
    adicionar(payload.message);
    adicionar(payload.errorMessage);
    adicionar(payload.error);
    adicionar(payload.details);

    if (Array.isArray(payload.errors)) {
      payload.errors.forEach((item) => {
        if (typeof item === "string") adicionar(item);
        else if (item && typeof item.message === "string") adicionar(item.message);
      });
    }

    if (payload.fields && typeof payload.fields === "object") {
      Object.values(payload.fields).forEach((campo) => {
        if (typeof campo === "string") adicionar(campo);
        else if (Array.isArray(campo)) {
          campo.forEach((item) => adicionar(String(item)));
        }
      });
    }
  }

  if (error?.message) {
    adicionar(error.message);
  }

  if (error?.code) {
    adicionar(`Código do erro: ${error.code}`);
  }

  if (detalhes.length === 0) {
    return fallback;
  }

  return detalhes.join(" Detalhes: ");
}
