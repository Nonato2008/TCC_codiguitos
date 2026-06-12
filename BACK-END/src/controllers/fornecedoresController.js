import { Fornecedores } from "../models/Fornecedores.js";
import fornecedoresRepository from "../repositories/fornecedoresRepository.js";

const fornecedoresController = {
    criar: async (req, res) => {
        try {
            const {nome} = req.body;
            const fornecedor = Fornecedores.criar({nome});
            const result = await fornecedoresRepository.criar(fornecedor); 
            res.status(201).json({result})
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },
    editar: async (req, res) => {
        try {
            const id = req.params.id;
            const {nome} = req.body;
            const fornecedor = Fornecedores.alterar({nome}, id);
            const result = await fornecedoresRepository.editar(fornecedor); 
            res.status(200).json({result})
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            await fornecedoresRepository.deletar(id);
            res.status(204).send();
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },
    selecionar: async (req, res) => {
        try {
            const result = await fornecedoresRepository.selecionar();
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    }
}

export default fornecedoresController
