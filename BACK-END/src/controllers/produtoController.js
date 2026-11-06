import { statusPed } from "../enums/statusVenda.js";
import { Produtos } from "../models/Produtos.js";
import produtosRepository from "../repositories/produtosRepository.js";
import {
    gerarNotaFiscal,
    gerarNotaFiscalPDF
} from "../services/notaFiscalService.js";

const parseDataLocal = (valor) => {
    if (!valor) return null;

    const texto = String(valor).trim();
    if (!texto) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        const [ano, mes, dia] = texto.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
    }

    return new Date(texto);
};

const calcularStatus = (quantidade, dataVenc) => {

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const vencimento = parseDataLocal(dataVenc);

    if (!vencimento || Number.isNaN(vencimento.getTime())) {
        return Number(quantidade) <= 0 ? statusPed.ESGOTADO : statusPed.ESTOQUE;
    }

    vencimento.setHours(0, 0, 0, 0);

    if (vencimento < hoje) {
        return statusPed.VENCIDO;
    }

    if (Number(quantidade) <= 0) {
        return statusPed.ESGOTADO;
    }

    return statusPed.ESTOQUE;
};

const normalizarDataParaBanco = (valor) => {

    if (!valor) return null;

    const texto = String(valor).trim();

    if (!texto) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return texto;
    }

    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
        return texto;
    }

    return data.toISOString().slice(0, 10);
};

const produtoController = {

    inserir: async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message: "Imagem não foi enviada"
                });

            }

            const {
                idFornecedor,
                nome,
                preco,
                custo,
                quantidade,
                dataVenc
            } = req.body;

            const dataVencNormalizada =
                normalizarDataParaBanco(dataVenc);

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const dataVencLocal = dataVencNormalizada
                ? new Date(`${dataVencNormalizada}T00:00:00`)
                : null;

            if (dataVencLocal && dataVencLocal < hoje) {
                return res.status(400).json({
                    message: "Não é permitido cadastrar produto vencido. Informe uma data de vencimento igual ou superior a hoje."
                });
            }

            const imagem =
                `/uploads/imagens/${req.file.filename}`;

            const status =
                calcularStatus(
                    quantidade,
                    dataVencNormalizada
                );

            const produto = Produtos.criar({

                idFornecedor,
                nome,
                preco,
                custo,
                quantidade,
                status,
                imagem,
                dataVenc: dataVencNormalizada

            });

            const result =
                await produtosRepository.criar(produto);

            const idProduto =
                result.insertId;

            const notaFiscal =
                gerarNotaFiscal({

                    id: idProduto,

                    idFornecedor,

                    nome,

                    preco,

                    quantidade

                });

            const pdf =
                await gerarNotaFiscalPDF(
                    notaFiscal
                );

            const pdfBase64 =
                pdf ? pdf.toString("base64") : null;

            res.status(201).json({

                message:
                    "Produto cadastrado com sucesso.",

                produto: {

                    id: idProduto,

                    idFornecedor:
                        Number(idFornecedor),

                    nome,

                    preco:
                        Number(preco),

                    custo:
                        Number(custo),

                    quantidade:
                        Number(quantidade),

                    status,

                    imagem,

                    dataVenc:
                        dataVencNormalizada

                },

                notaFiscal,

                pdf: pdfBase64

            });

        } catch (error) {

            console.error(error);

            const mensagem = (error?.message || "").toLowerCase();

            if (
                mensagem.includes("out of range value for column 'preco'") ||
                mensagem.includes("out of range value for column \"preco\"") ||
                mensagem.includes("preco excede o limite permitido")
            ) {
                return res.status(400).json({
                    message: "Preço fora do limite permitido. Informe um valor até R$ 9.999.999,99 e verifique também o limite de 45 caracteres no nome do produto."
                });
            }

            if (
                mensagem.includes("out of range value for column 'custo'") ||
                mensagem.includes("out of range value for column \"custo\"") ||
                mensagem.includes("custo excede o limite permitido")
            ) {
                return res.status(400).json({
                    message: "Custo fora do limite permitido. Informe um valor entre R$ 0,00 e R$ 9.999.999,99."
                });
            }

            if (mensagem.includes("o custo deve ser")) {
                return res.status(400).json({ message: error.message });
            }

            if (
                mensagem.includes("out of range value for column 'quantidade'") ||
                mensagem.includes("out of range value for column \"quantidade\"") ||
                mensagem.includes("quantidade excede o limite permitido")
            ) {
                return res.status(400).json({
                    message: "Quantidade fora do limite permitido. Informe uma quantidade até 999.999 unidades."
                });
            }

            res.status(500).json({

                message:
                    "Erro ao inserir produto",

                errorMessage:
                    error.message

            });

        }

    },

    alterar: async (req, res) => {

        try {

            const id = req.params.id;

            const produtoAtual =
                await produtosRepository.selecionarId(id);

            const {
                idFornecedor,
                nome,
                preco,
                custo,
                quantidade,
                dataVenc,
                imagem: imagemInformada
            } = req.body;

            const imagem = req.file
                ? `/uploads/imagens/${req.file.filename}`
                : (
                    typeof imagemInformada === "string" &&
                    imagemInformada.trim() !== ""
                        ? imagemInformada
                        : (
                            produtoAtual?.Imagem ||
                            produtoAtual?.imagem ||
                            "/uploads/imagens/default.png"
                        )
                );

            const dataVencFinal =
                normalizarDataParaBanco(
                    dataVenc ||
                    produtoAtual?.DataVenc ||
                    produtoAtual?.dataVenc ||
                    "2035-12-31"
                );

            const quantidadeFinal =
                Number(
                    quantidade ??
                    produtoAtual?.Quantidade ??
                    produtoAtual?.quantidade ??
                    0
                );

            const precoFinal =
                Number(
                    preco ??
                    produtoAtual?.Preco ??
                    produtoAtual?.preco ??
                    1
                );

            const custoFinal =
                Number(
                    custo ??
                    produtoAtual?.Custo ??
                    produtoAtual?.custo ??
                    0
                );

            const idFornecedorFinal =
                Number(
                    idFornecedor ??
                    produtoAtual?.IdFornecedor ??
                    produtoAtual?.idFornecedor ??
                    1
                );

            const nomeFinal =
                nome ||
                produtoAtual?.Nome ||
                produtoAtual?.nome ||
                "Produto";

            const status =
                calcularStatus(
                    quantidadeFinal,
                    dataVencFinal
                );

            const produto = Produtos.alterar({

                idFornecedor:
                    idFornecedorFinal,

                nome:
                    nomeFinal,

                preco:
                    precoFinal,

                custo:
                    custoFinal,

                quantidade:
                    quantidadeFinal,

                status,

                imagem,

                dataVenc:
                    dataVencFinal

            }, id);

            const result =
                await produtosRepository.editar(produto);

            res.status(200).json({

                message:
                    "Produto alterado com sucesso",

                result

            });

        } catch (error) {

            console.error(error);

            if ((error?.message || "").toLowerCase().includes("custo")) {
                return res.status(400).json({
                    message: error.message
                });
            }

            res.status(500).json({

                message:
                    "Erro ao alterar produto",

                errorMessage:
                    error.message

            });

        }

    },

    ajustarEstoque: async (req, res) => {
        const id = Number(req.params.id);
        const { operacao, quantidade } = req.body ?? {};

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID do produto inválido."
            });
        }

        if (!["entrada", "saida"].includes(operacao)) {
            return res.status(400).json({
                message: "Selecione uma operação válida para o estoque."
            });
        }

        if (
            !Number.isSafeInteger(quantidade) ||
            quantidade <= 0 ||
            quantidade > 999999
        ) {
            return res.status(400).json({
                message: "Informe uma quantidade inteira entre 1 e 999.999."
            });
        }

        try {
            const resultado = await produtosRepository.ajustarEstoque(
                id,
                operacao,
                quantidade
            );

            if (!resultado) {
                return res.status(404).json({
                    message: "Produto não encontrado."
                });
            }

            return res.status(200).json({
                message: "Estoque atualizado com sucesso.",
                ...resultado
            });
        } catch (error) {
            console.error(error);

            return res.status(error.statusCode || 500).json({
                message: error.statusCode
                    ? error.message
                    : "Erro ao atualizar o estoque.",
                errorMessage: error.statusCode ? undefined : error.message
            });
        }
    },

    deletar: async (req, res) => {

        try {

            const id = req.params.id;

            await produtosRepository.deletar(id);

            res.status(200).json({

                message:
                    "Produto deletado com sucesso"

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Erro ao deletar produto",

                errorMessage:
                    error.message

            });

        }

    },

    selecionar: async (req, res) => {

        try {

            const result =
                await produtosRepository.selecionar();

            res.status(200).json({

                result

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Erro ao selecionar produtos",

                errorMessage:
                    error.message

            });

        }

    },

    selecionarId: async (req, res) => {

        try {

            const id = req.params.id;

            const result =
                await produtosRepository.selecionarId(id);

            res.status(200).json({

                result

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Erro ao selecionar produto",

                errorMessage:
                    error.message

            });

        }

    }

};

export default produtoController;