import { Router } from 'express';
const routes = Router()
import categoriaRoutes from './categoriaRoutes.js';
import produtosRoutes from './produtosRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';


routes.use('/categorias', categoriaRoutes);
routes.use('/produtos', produtosRoutes);
routes.use('/pedidos', pedidoRoutes);

export default routes;
