import {Router} from 'express';
import produtoController from '../controllers/produtoController.js';
import uploadImage from '../middlewares/uploadImagem.middleware.js';

const produtosRoutes = Router();

produtosRoutes.post('/', uploadImage, produtoController.inserir);
produtosRoutes.put('/:id', uploadImage, produtoController.alterar);
produtosRoutes.delete('/:id', produtoController.deletar);
produtosRoutes.get('/', produtoController.selecionar);
produtosRoutes.get('/:id', produtoController.selecionarId);

export default produtosRoutes;