import { Proprietario } from "../models/Proprietario.js";
import proprietariosRepository from "../repositories/proprietarioRepository.js";

const proprietariosController = {

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
    },
    criar: async (req, res) => {
        try {
            const { nome, senha } = req.body;
            const proprietario = Proprietario.criar({

                nome,
                senha

            });


            const result =
                await proprietariosRepository.criar(proprietario);


            res.status(201).json({

                message: 'Proprietário criado com sucesso',

                result

            });
        } catch (error) {
            res.status(400).json({ message: 'Erro ao criar proprietário', error: error.message });
        }
    },
    editar: async (req, res) => {
        try {
            const id = req.params.id;
            const { nome, senha } = req.body;
            const proprietario = Proprietario.alterar({

                nome,
                senha
            }, id);


            const result =
                await proprietariosRepository.editar(proprietario);


            res.status(200).json({

                message: 'Proprietário alterado com sucesso',

                result

            });
        } catch (error) {
            res.status(400).json({ message: 'Erro ao alterar proprietário', error: error.message });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            await proprietariosRepository.deletar(id);
            res.status(200).json({ message: 'Proprietário deletado com sucesso' }); 

}         catch (error) {
            res.status(500).json({ message: 'Erro ao deletar proprietário', errorMessage: error.message });
        }
    }
    }


export default proprietariosController;