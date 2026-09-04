function FornecedorCard({ fornecedor }) {

    const imagem = fornecedor.Imagem
        ? `http://localhost:8000${fornecedor.Imagem}`
        : null;

    return (
        <div style={styles.card}>

          
            <div style={styles.cardImageContainer}>

                {imagem ? (
                    <img
                        src={imagem}
                        alt={fornecedor.Nome}
                        style={styles.imagem}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div style={styles.noImage}>
                        <span className="material-symbols-outlined">
                            business
                        </span>
                    </div>
                )}

            </div>

            
            <div style={styles.cardContent}>

                <div style={styles.cardTop}>

                    <span style={styles.label}>
                        FORNECEDOR
                    </span>

                    <span style={styles.id}>
                        #{fornecedor.Id}
                    </span>

                </div>

                <h3 style={styles.nome}>
                    {fornecedor.Nome}
                </h3>

                <div style={styles.cardFooter}>

                    <span className="material-symbols-outlined">
                        local_shipping
                    </span>

                    <span>
                        Fornecedor cadastrado
                    </span>

                </div>

            </div>

        </div>
    );
}