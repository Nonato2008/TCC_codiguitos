import { ItensVendas } from "../models/ItensVendas.js";
import itensVendasRepository from "../repositories/itensVendasRepository.js";

const itensVendasController = {

    selecionarId: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await itensVendasRepository.selecionarId(id);
            res.status(200).json({ result });   
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar item de venda', errorMessage: error.message });
        }
    }

};
export default itensVendasController;