function ProductCard({ produto, onAdicionar }) {
    return (
        <div className="product-card">

            <img
                src={`http://localhost:8000/imagens/${produto.id}`}
                alt={produto.nome}
                width="200"
            />

            <h3>
                {produto.nome}
            </h3>

            <p>
                R$ {Number(produto.preco || 0).toFixed(2)}
            </p>

            <button onClick={() => onAdicionar(produto)}>
                Adicionar ao carrinho
            </button>

        </div>
    );
}

export default ProductCard;