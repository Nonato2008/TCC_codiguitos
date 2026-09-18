import { statusPed } from "../enums/statusVenda.js";
import { Produtos } from "../models/Produtos.js";
import produtosRepository from "../repositories/produtosRepository.js";
import {
    gerarNotaFiscal,
    gerarNotaFiscalPDF
} from "../services/notaFiscalService.js";

const calcularStatus = (quantidade, dataVenc) => {

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(dataVenc);

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
                quantidade,
                dataVenc
            } = req.body;

            const dataVencNormalizada =
                normalizarDataParaBanco(dataVenc);

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
                pdf.toString("base64");

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

            res.status(500).json({

                message:
                    "Erro ao alterar produto",

                errorMessage:
                    error.message

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