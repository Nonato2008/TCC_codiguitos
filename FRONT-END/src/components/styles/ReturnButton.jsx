/*
  Componente: ReturnButton.jsx
  - Botão simples para navegar para a rota anterior (`navigate(-1)`).
*/
import { useNavigate } from "react-router-dom";

export default function ReturnButton() {

    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)}>
            Voltar
        </button>
    );
}

