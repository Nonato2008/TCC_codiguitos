import { Router } from 'express';
const routes = Router()
import fornecedoresRoutes from './fornecedoresRoutes.js';
import produtosRoutes from './produtosRoutes.js';
import vendasRoutes from './vendasRoutes.js';


routes.use('/fornecedores', fornecedoresRoutes);
routes.use('/produtos', produtosRoutes);
routes.use('/vendas', vendasRoutes);

export default routes;
