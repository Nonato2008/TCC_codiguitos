import { Fornecedores } from "../models/Fornecedores.js";
import fornecedoresRepository from "../repositories/fornecedoresRepository.js";

const fornecedoresController = {


criar: async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: 'Imagem não foi enviada'
            });
        }
        const { nome } = req.body;
        const imagem =`/uploads/imagens/${req.file.filename}`;
        const fornecedor = Fornecedores.criar({

            nome,
            imagem

        });


        const result =
            await fornecedoresRepository.criar(fornecedor);


        res.status(201).json({

            message: 'Fornecedor criado com sucesso',

            result

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({

            message: 'Ocorreu um erro no servidor',

            errorMessage: error.message

        });

    }

},


editar: async (req, res) => {

    try {

        const id = req.params.id;


        const { nome } = req.body;


        const imagem = req.file
            ? `/uploads/imagens/${req.file.filename}`
            : null;


        const fornecedor = Fornecedores.alterar({

            nome,
            imagem

        }, id);


        const result =
            await fornecedoresRepository.editar(fornecedor);


        res.status(200).json({

            message: 'Fornecedor alterado com sucesso',

            result

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({

            message: 'Ocorreu um erro no servidor',

            errorMessage: error.message

        });

    }

},


deletar: async (req, res) => {

    try {

        const id = req.params.id;


        await fornecedoresRepository.deletar(id);


        res.status(204).send();


    } catch (error) {

        console.log(error);


        res.status(500).json({

            message: 'Ocorreu um erro no servidor',

            errorMessage: error.message

        });

    }

},


selecionar: async (req, res) => {

    try {

        const result =
            await fornecedoresRepository.selecionar();


        res.status(200).json(result);


    } catch (error) {

        console.log(error);


        res.status(500).json({

            message: 'Ocorreu um erro no servidor',

            errorMessage: error.message

        });

    }

},


selecionarId: async (req, res) => {

    try {

        const id = req.params.id;


        const result =
            await fornecedoresRepository.selecionarId(id);


        res.status(200).json(result);


    } catch (error) {

        console.log(error);


        res.status(500).json({

            message: 'Ocorreu um erro no servidor',

            errorMessage: error.message

        });

    }

}


};

export default fornecedoresController;
