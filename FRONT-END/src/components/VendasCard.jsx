import { useNavigate } from "react-router-dom";

export default function VendasCard({ venda }) {

    const navigate = useNavigate();

    // Navega para a tela de detalhes da venda usando o Id
    function irParaProfile() {
        navigate(`/vendas/${venda.Id}`);
    }

    return (
        <div style={styles.card}>

            <div style={styles.info}>

                {/* Número da venda em destaque */}
                <div style={styles.number}>
                    {venda.Id}
                </div>

                <div>

                    <div style={styles.details}>

                        <span>
                            <strong>Vendedor:</strong>{" "}
                            {venda.NomeVendedor}
                        </span>

                        {/* Formata a data em pt-BR (dd/mm/aaaa); "-" se não houver */}
                        <span>
                            <strong>Data:</strong>{" "}
                            {venda.DataCad
                                ? new Date(venda.DataCad)
                                    .toLocaleDateString("pt-BR")
                                : "-"
                            }
                        </span>

                    </div>

                    {/* Valor total formatado com 2 casas e vírgula decimal */}
                    <div style={styles.price}>
                        R$ {Number(venda.ValorTotal)
                            .toFixed(2)
                            .replace(".", ",")}
                    </div>

                </div>

            </div>


            <button
                onClick={irParaProfile}
                style={styles.button}
            >
                Detalhes
            </button>

        </div>
    );
}

const styles = {

    card: {
        width: "100%",
        boxSizing: "border-box",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",

        backgroundColor: "#ffffff",

        padding: "18px 22px",
        marginBottom: "14px",

        borderRadius: "10px",
        border: "1px solid #e2e8f0",

        boxShadow: "0 2px 7px rgba(0, 0, 0, 0.04)",

        transition: "0.2s",
    },

    info: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
    },

    number: {
        width: "45px",
        height: "45px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: "9px",

        backgroundColor: "#eef4ff",
        color: "#303e51",

        fontSize: "15px",
        fontWeight: "700",
    },

    title: {
        margin: "0 0 7px 0",
        fontSize: "17px",
        color: "#243447",
    },

    details: {
        display: "flex",
        gap: "25px",

        color: "#718096",
        fontSize: "13px",
    },

    price: {
        marginTop: "7px",

        color: "#303e51",
        fontSize: "16px",
        fontWeight: "700",
    },

    button: {
        border: "none",
        borderRadius: "7px",

        padding: "10px 17px",

        backgroundColor: "#303e51",
        color: "#ffffff",

        fontSize: "14px",
        fontWeight: "600",

        cursor: "pointer",
    },
};