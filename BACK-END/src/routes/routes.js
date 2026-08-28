import { Router } from "express";

import fornecedoresRoutes from "./fornecedoresRoutes.js";
import produtosRoutes from "./produtosRoutes.js";
import vendasRoutes from "./vendasRoutes.js";
import proprietarioRoutes from "./proprietarioRoutes.js";
import itensVendasRoutes from "./itenVendasRoutes.js";
import vendedoresRoutes from "./vendedoresRoutes.js";
import authRoutes from "./authRoutes.js";

const routes = Router();

routes.use("/", authRoutes);

routes.use("/proprietarios", proprietarioRoutes);
routes.use("/itens-vendas", itensVendasRoutes);
routes.use("/fornecedores", fornecedoresRoutes);
routes.use("/produtos", produtosRoutes);
routes.use("/vendas", vendasRoutes);
routes.use("/vendedores", vendedoresRoutes);

export default routes;