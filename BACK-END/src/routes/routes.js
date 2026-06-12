import { Router } from 'express';
const routes = Router()
import fornecedoresRoutes from './fornecedoresRoutes.js';
import produtosRoutes from './produtosRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';


routes.use('/fornecedores', fornecedoresRoutes);
routes.use('/produtos', produtosRoutes);
routes.use('/pedidos', pedidoRoutes);

export default routes;
