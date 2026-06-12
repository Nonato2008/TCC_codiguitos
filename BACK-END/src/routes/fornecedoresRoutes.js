import {Router} from 'express';
import fornecedoresController from '../controllers/fornecedoresController.js';
const fornecedoresRoutes = Router();

fornecedoresRoutes.post('/', fornecedoresController.criar);
fornecedoresRoutes.put('/:id', fornecedoresController.editar);
fornecedoresRoutes.delete('/:id', fornecedoresController.deletar);
fornecedoresRoutes.get('/', fornecedoresController.selecionar);

export default fornecedoresRoutes;
