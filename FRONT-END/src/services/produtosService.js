import { codiguitos_api } from "./tcc.api";

function normalizarDataVenc(dataVenc) {
  if (!dataVenc) return null;

  const valor = String(dataVenc).trim();
  if (!valor) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toISOString().slice(0, 10);
}

export async function buscarProdutos() {
  try {
    const response = await codiguitos_api.get("/produtos");

    if (Array.isArray(response.data?.result)) {
      return response.data.result;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function atualizarProduto(id, dados) {
  try {
    const formData = new FormData();

    formData.append("idFornecedor", String(dados.idFornecedor ?? 1));
    formData.append("nome", String(dados.nome ?? ""));
    formData.append("preco", String(Number(dados.preco ?? 1)));
    formData.append("quantidade", String(Number(dados.quantidade ?? 0)));

    const dataVencNormalizada = normalizarDataVenc(dados.dataVenc);
    if (dataVencNormalizada) {
      formData.append("dataVenc", dataVencNormalizada);
    }

    // Somente envia imagem quando ela for um arquivo real do upload.
    // Para ajuste de estoque, a imagem não muda e esse campo não deve ser
    // interpretado como um arquivo pelo Multer.
    if (dados.imagem && typeof dados.imagem === "object" && "name" in dados.imagem) {
      formData.append("imagem", dados.imagem);
    }

    await codiguitos_api.put(`/produtos/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return true;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}
