import { Proprietario } from "../models/Proprietario";
import proprietariosRepository from "../repositories/proprietarioRepository.js";

const proprietariosController  = {

    selecionarId: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await proprietariosRepository.selecionarId(id);
            res.status(200).json({ result });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    selecionar: async (req,res) => {
        try {
            const result = await proprietariosRepository.selecionar();
            return res.status(200).json(result);

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao buscar proprietários",
                errorMessage: error.message
            });
        }
    }
}


export default proprietariosController;