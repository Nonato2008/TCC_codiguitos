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
    }
}


export default proprietariosController;