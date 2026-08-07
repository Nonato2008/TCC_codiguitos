import { Vendedores } from "../models/Vendedores.js";
import vendedoresRepository from "../repositories/vendedoresRepository.js";

const vendedoresController = {

    selecionarId: async (req, res) => {
        try {
            const id = req.params;

            const result = await vendedoresRepository.selecionarId(Number(id));
            return res.status(200).json(result);
        } catch (error) {
            return res.status(404).json({ message: "Vendedor não encontrado", errorMessage: error.message });    
        }
    }
}

export default vendedoresController;