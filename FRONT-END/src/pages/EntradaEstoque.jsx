import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import { buscarProdutos } from "../services/produtosService";
import { buscarFornecedores } from "../services/fornecedoresService";
import { registrarEntrada } from "../services/entradasService";

export default function EntradaEstoque() {

    const navigate = useNavigate();

    const [fornecedores, setFornecedores] = useState([]);
    const [produtos, setProdutos] = useState([]);

    const [idFornecedor, setIdFornecedor] = useState("");
    const [numeroNF, setNumeroNF] = useState("");

    const [idProduto, setIdProduto] = useState("");
    const [numeroLote, setNumeroLote] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [dataVenc, setDataVenc] = useState("");

    const [itens, setItens] = useState([]);

    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {

        try {

            const listaFornecedores =
                await buscarFornecedores();

            const listaProdutos =
                await buscarProdutos();

            const fornecedoresNormalizados =
                Array.isArray(listaFornecedores)
                    ? listaFornecedores
                    : (listaFornecedores?.result || []);

            const produtosNormalizados =
                Array.isArray(listaProdutos)
                    ? listaProdutos
                    : (listaProdutos?.result || []);

            setFornecedores(fornecedoresNormalizados);
            setProdutos(produtosNormalizados);

        } catch (error) {

            console.error(error);

            setMensagem(
                "Erro ao carregar fornecedores e produtos."
            );
        }
    }

    function adicionarProduto(event) {

        event.preventDefault();

        if (!idFornecedor) {

            setMensagem(
                "Selecione um fornecedor."
            );

            return;
        }

        if (!idProduto) {

            setMensagem(
                "Selecione um produto."
            );

            return;
        }

        if (!quantidade || Number(quantidade) <= 0) {

            setMensagem(
                "Informe uma quantidade válida."
            );

            return;
        }

        if (!numeroLote.trim()) {

            setMensagem(
                "Informe o número do lote."
            );

            return;
        }

        if (!dataVenc) {

            setMensagem(
                "Informe a data de vencimento."
            );

            return;
        }

        const produtoSelecionado =
            produtos.find(
                produto =>
                    Number(produto.Id ?? produto.id) ===
                    Number(idProduto)
            );

        if (!produtoSelecionado) {

            setMensagem(
                "Produto não encontrado."
            );

            return;
        }

        const produtoJaAdicionado =
            itens.some(
                item =>
                    Number(item.idProduto) ===
                    Number(idProduto)
            );

        if (produtoJaAdicionado) {

            setMensagem(
                "Esse produto já foi adicionado à entrada."
            );

            return;
        }

        const novoItem = {

            idProduto: Number(idProduto),

            nomeProduto:
                produtoSelecionado.Nome ??
                produtoSelecionado.nome,

            quantidade:
                Number(quantidade),

            numeroLote,

            dataVenc
        };

        setItens([
            ...itens,
            novoItem
        ]);

        setIdProduto("");
        setNumeroLote("");
        setQuantidade("");
        setDataVenc("");
        setMensagem("");
    }

    function removerProduto(index) {

        const novaLista =
            itens.filter(
                (_, i) => i !== index
            );

        setItens(novaLista);
    }

    async function finalizarEntrada(event) {

        event.preventDefault();

        if (!idFornecedor) {

            setMensagem(
                "Selecione o fornecedor."
            );

            return;
        }

        if (!numeroNF) {

            setMensagem(
                "Informe o número da Nota Fiscal."
            );

            return;
        }

        if (itens.length === 0) {

            setMensagem(
                "Adicione pelo menos um produto."
            );

            return;
        }

        try {

            setCarregando(true);
            setMensagem("");

            await registrarEntrada({
                idFornecedor: Number(idFornecedor),
                numeroNF,
                itens: itens.map(item => ({
                    idProduto: item.idProduto,
                    quantidade: item.quantidade,
                    numeroLote: item.numeroLote,
                    dataVenc: item.dataVenc
                }))
            });

            setMensagem(
                "Entrada de mercadorias registrada com sucesso!"
            );

            setItens([]);
            setNumeroNF("");
            setIdFornecedor("");

        } catch (error) {

            console.error(error);

            setMensagem(
                error.response?.data?.mensagem ||
                "Erro ao registrar entrada."
            );

        } finally {

            setCarregando(false);
        }
    }

    return (

        <div style={styles.layout}>
            <Sidebar />

            <main style={styles.container}>
                <div style={styles.header}>

                <h1>
                    Entrada de Mercadorias
                </h1>

                <button
                    onClick={() =>
                        navigate("/gerenciamentoEstoque")
                    }
                    style={styles.voltar}
                >
                    Voltar
                </button>

            </div>

            <form onSubmit={finalizarEntrada}>

                <div style={styles.card}>

                    <h2>
                        Dados da Nota Fiscal
                    </h2>

                    <label>
                        Fornecedor
                    </label>

                    <select
                        value={idFornecedor}
                        onChange={event =>
                            setIdFornecedor(
                                event.target.value
                            )
                        }
                        style={styles.input}
                    >

                        <option value="">
                            Selecione um fornecedor
                        </option>

                        {fornecedores.map(
                            fornecedor => (

                                <option
                                    key={
                                        fornecedor.Id ??
                                        fornecedor.id
                                    }
                                    value={
                                        fornecedor.Id ??
                                        fornecedor.id
                                    }
                                >
                                    {
                                        fornecedor.Nome ??
                                        fornecedor.nome
                                    }
                                </option>

                            )
                        )}

                    </select>

                    <label>
                        Número da Nota Fiscal
                    </label>

                    <input
                        type="text"
                        value={numeroNF}
                        onChange={event =>
                            setNumeroNF(
                                event.target.value
                            )
                        }
                        placeholder="Ex: 000123"
                        style={styles.input}
                    />

                </div>


                <div style={styles.card}>

                    <h2>
                        Produtos da Entrada
                    </h2>

                    <label>
                        Produto
                    </label>

                    <select
                        value={idProduto}
                        onChange={event =>
                            setIdProduto(
                                event.target.value
                            )
                        }
                        style={styles.input}
                    >

                        <option value="">
                            Selecione um produto
                        </option>

                        {produtos.map(
                            produto => (

                                <option
                                    key={
                                        produto.Id ??
                                        produto.id
                                    }
                                    value={
                                        produto.Id ??
                                        produto.id
                                    }
                                >
                                    {
                                        produto.Nome ??
                                        produto.nome
                                    }
                                </option>

                            )
                        )}

                    </select>


                    <label>
                        Número do Lote
                    </label>

                    <input
                        type="text"
                        value={numeroLote}
                        onChange={event =>
                            setNumeroLote(
                                event.target.value
                            )
                        }
                        placeholder="Ex: LOTE-2026-001"
                        style={styles.input}
                    />


                    <label>
                        Quantidade recebida
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={quantidade}
                        onChange={event =>
                            setQuantidade(
                                event.target.value
                            )
                        }
                        placeholder="Quantidade"
                        style={styles.input}
                    />


                    <label>
                        Data de vencimento
                    </label>

                    <input
                        type="date"
                        value={dataVenc}
                        onChange={event =>
                            setDataVenc(
                                event.target.value
                            )
                        }
                        style={styles.input}
                    />


                    <button
                        type="button"
                        onClick={adicionarProduto}
                        style={styles.botaoAdicionar}
                    >
                        + Adicionar Produto
                    </button>

                </div>


                {itens.length > 0 && (

                    <div style={styles.card}>

                        <h2>
                            Produtos adicionados
                        </h2>

                        {itens.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    style={styles.item}
                                >

                                    <div>

                                        <strong>
                                            {item.nomeProduto}
                                        </strong>

                                        <p>
                                            Quantidade:{" "}
                                            {item.quantidade}
                                        </p>

                                        <p>
                                            Lote:{" "}
                                            {item.numeroLote ||
                                                "Não informado"}
                                        </p>

                                        <p>
                                            Vencimento:{" "}
                                            {item.dataVenc}
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removerProduto(
                                                index
                                            )
                                        }
                                        style={styles.remover}
                                    >
                                        Remover
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}


                {mensagem && (

                    <div style={styles.mensagem}>
                        {mensagem}
                    </div>

                )}


                <button
                    type="submit"
                    disabled={carregando}
                    style={styles.finalizar}
                >
                    {carregando
                        ? "Registrando..."
                        : "Confirmar Entrada"}
                </button>

            </form>
            </main>
        </div>
    );
}


const styles = {

    layout: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f3f5f9",
        fontFamily: "Inter, sans-serif"
    },

    container: {
        marginLeft: "256px",
        width: "calc(100% - 256px)",
        padding: "32px",
        maxWidth: "1100px",
        boxSizing: "border-box"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px"
    },

    card: {
        background: "#fff",
        padding: "25px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.1)"
    },

    input: {
        width: "100%",
        padding: "12px",
        marginTop: "7px",
        marginBottom: "15px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        boxSizing: "border-box"
    },

    botaoAdicionar: {
        padding: "12px 20px",
        border: "none",
        borderRadius: "6px",
        background: "#198754",
        color: "#fff",
        cursor: "pointer"
    },

    finalizar: {
        width: "100%",
        padding: "15px",
        border: "none",
        borderRadius: "6px",
        background: "#0d6efd",
        color: "#fff",
        fontSize: "16px",
        cursor: "pointer"
    },

    voltar: {
        padding: "10px 18px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },

    item: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px",
        marginBottom: "10px",
        border: "1px solid #ddd",
        borderRadius: "8px"
    },

    remover: {
        background: "#dc3545",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: "5px",
        cursor: "pointer"
    },

    mensagem: {
        padding: "15px",
        marginBottom: "15px",
        borderRadius: "6px",
        background: "#f1f1f1"
    }
};