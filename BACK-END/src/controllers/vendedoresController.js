import { Vendedores } from "../models/Vendedores";
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
    },
    selecionar: async (res) => {
        try {
            const result = await vendedoresRepository.selecionar({result});
            res.status(200).json
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar vendedores', errorMessage: error.message})
        }
    }
}

export default vendedoresController;