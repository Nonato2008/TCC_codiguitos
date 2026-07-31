import {Router} from 'express';
import fornecedoresController from '../controllers/fornecedoresController.js';
import uploadImage from '../middlewares/uploadImagem.middleware.js';
const fornecedoresRoutes = Router();

fornecedoresRoutes.post('/', uploadImage, fornecedoresController.criar);
fornecedoresRoutes.put('/:id', uploadImage, fornecedoresController.editar);
fornecedoresRoutes.delete('/:id', fornecedoresController.deletar);
fornecedoresRoutes.get('/', fornecedoresController.selecionar);

export default fornecedoresRoutes;
