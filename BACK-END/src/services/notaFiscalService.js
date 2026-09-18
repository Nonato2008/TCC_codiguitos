import PDFDocument from "pdfkit";

function gerarNumeroNota() {

    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    const segundo = String(data.getSeconds()).padStart(2, "0");

    return `${dia}${mes}${ano}${hora}${minuto}${segundo}`;
}

export function gerarNotaFiscal(produto) {

    const valorTotal =
        Number(produto.preco) *
        Number(produto.quantidade);

    return {

        numero: gerarNumeroNota(),

        dataEmissao:
            new Date().toISOString(),

        fornecedor: {
            id: Number(produto.idFornecedor)
        },

        produto: {

            id: produto.id,

            nome: produto.nome,

            quantidade:
                Number(produto.quantidade),

            precoUnitario:
                Number(produto.preco),

            valorTotal:
                valorTotal

        },

        total: valorTotal

    };
}

export async function gerarNotaFiscalPDF(notaFiscal) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50
            });

            const partes = [];

            doc.on("data", (parte) => {
                partes.push(parte);
            });

            doc.on("end", () => {
                resolve(Buffer.concat(partes));
            });

            doc.on("error", (err) => {
                reject(err);
            });

            doc
                .fontSize(22)
                .font("Helvetica-Bold")
                .text("ADEGA DO NELSON", {
                    align: "center"
                });

            doc
                .moveDown()
                .fontSize(18)
                .text("NOTA FISCAL", {
                    align: "center"
                });

            doc
                .moveDown(2)
                .fontSize(11)
                .font("Helvetica")
                .text(`Número da nota: ${notaFiscal.numero}`);

            doc
                .text(`Data de emissão: ${new Date(notaFiscal.dataEmissao).toLocaleString("pt-BR")}`);

            doc
                .text(`Fornecedor: ${notaFiscal.fornecedor.id}`);

            doc.moveDown(2);

            doc
                .fontSize(13)
                .font("Helvetica-Bold")
                .text("DADOS DO PRODUTO");

            doc.moveDown();

            doc
                .fontSize(11)
                .font("Helvetica")
                .text(`Produto: ${notaFiscal.produto.nome}`);

            doc
                .text(`Quantidade: ${notaFiscal.produto.quantidade}`);

            doc
                .text(`Preço unitário: ${Number(notaFiscal.produto.precoUnitario).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })}`);

            doc
                .text(`Valor total: ${Number(notaFiscal.produto.valorTotal).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })}`);

            doc.moveDown(2);

            doc
                .fontSize(16)
                .font("Helvetica-Bold")
                .text(`TOTAL: ${Number(notaFiscal.total).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })}`);

            doc.moveDown(4);

            doc
                .fontSize(9)
                .font("Helvetica")
                .text("Documento gerado automaticamente pelo sistema Adega do Nelson.", {
                    align: "center"
                });

            doc
                .text("Esta nota fiscal não é armazenada no banco de dados.", {
                    align: "center"
                });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}