import { useEffect, useState } from "react";
import ProductCard from "../../components/produtoCard";
import { buscarProdutos } from "../../services/tcc.api";

function Produtos() {
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        carregarProdutos();
    }, []);

    async function carregarProdutos() {
        try {
            const resposta = await buscarProdutos();

            console.log("Produtos recebidos:", resposta);

            setProdutos(resposta);

        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        }
    }

    function adicionarAoCarrinho(produto) {
        console.log("Produto adicionado ao carrinho:", produto);
    }

    return (
        <div>
            <h1>Produtos</h1>

            <div className="produtos">
                {produtos.map((produto, index) => (
                    <ProductCard
                        key={produto.id ?? index}
                        produto={produto}
                        onAdicionar={adicionarAoCarrinho}
                    />
                ))}
            </div>
        </div>
    );
}

export default Produtos;