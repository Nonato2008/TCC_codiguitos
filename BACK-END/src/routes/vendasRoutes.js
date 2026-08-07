import { Router } from "express";
import vendasController from "../controllers/vendasController.js";
const vendasRoutes = Router();


// Rota para criar um novo pedido
vendasRoutes.post("/", vendasController.criar);
vendasRoutes.get("/", vendasController.selecionar);
vendasRoutes.get("/:id", vendasController.selecionarId);
vendasRoutes.put("/:id", vendasController.editar);
vendasRoutes.delete("/:id", vendasController.deletar);
vendasRoutes.post("/:id/item", vendasController.adicionarItem);
vendasRoutes.put("/:id/item/:itemId", vendasController.editarItem);
vendasRoutes.delete("/:id/item/:itemId", vendasController.removerItem);
vendasRoutes.patch("/:id/status", vendasController.editarStatus);

export default vendasRoutes;