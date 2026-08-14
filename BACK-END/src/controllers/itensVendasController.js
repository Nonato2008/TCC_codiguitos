import { ItensVendas } from "../models/ItensVendas.js";
import itensVendasRepository from "../repositories/itensVendasRepository.js";

const itensVendasController = {

    
// Select - GET by ID____________________________________________________________________
    selecionarId: async (req, res) => {

        try {

            const id = req.params.id;

            const result = await itensVendasRepository.selecionarId(id);

            res(200).json({ result });
        } catch (error) {

            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar item de venda', errorMessage: error.message });
        }
    }
};
export default itensVendasController;