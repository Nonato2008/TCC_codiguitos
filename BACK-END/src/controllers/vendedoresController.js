import { Vendedores } from "../models/Vendedores.js";
import vendedoresRepository from "../repositories/vendedoresRepository.js";

const vendedoresController = {

    selecionarId: async (req, res) => {
        try {
            const id = req.params.id;

            const result = await vendedoresRepository.selecionarId(id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(404).json({ message: "Vendedor não encontrado", errorMessage: error.message });    
        }
    },
    selecionar: async (req, res) => {
        try {
            const result = await vendedoresRepository.selecionar();
            res.status(200).json(result)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar vendedores', errorMessage: error.message})
        }
    },
     criar: async (req, res) => {
        try {
            const { nome, idProprietario } = req.body;
            const vendedor = Vendedores.criar({

            nome,
            idProprietario
        });


        const result =
            await vendedoresRepository.criar(vendedor);


        res.status(201).json({

            message: 'Vendedor criado com sucesso',

            result

        });
        } catch (error) {
            res.status(400).json({ message: 'Erro ao criar vendedor', error: error.message });
        }
    },
    editar: async (req, res) => {
        try {
            const id = req.params.id;
            const { nome, idProprietario } = req.body;
            const vendedor = Vendedores.alterar({

            nome,
            idProprietario
        }, id);


        const result =
            await vendedoresRepository.editar(vendedor);


        res.status(200).json({

            message: 'Vendedor alterado com sucesso',

            result

        });
        } catch (error) {
            res.status(400).json({ message: 'Erro ao alterar proprietário', error: error.message });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            await vendedoresRepository.deletar(id);
            res.status(200).json({ message: 'Vendedor deletado com sucesso' }); } 
            
            catch (error) {
            res.status(500).json({ message: 'Erro ao deletar vendedor', errorMessage: error.message });
        }
    }
}

export default vendedoresController; 