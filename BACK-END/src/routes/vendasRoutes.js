import { Router } from "express";
import pedidoController from "../controllers/vendasController.js";

const vendasRoutes = Router();


// Rota para criar um novo pedido
vendasRoutes.post("/", pedidoController.criar);
vendasRoutes.get("/", pedidoController.selecionar);
vendasRoutes.get("/:id", pedidoController.selecionarId);
vendasRoutes.put("/:id", pedidoController.editar);
vendasRoutes.delete("/:id", pedidoController.deletar);
vendasRoutes.post("/:id/item", pedidoController.adicionarItem);
vendasRoutes.put("/:id/item/:itemId", pedidoController.editarItem);
vendasRoutes.delete("/:id/item/:itemId", pedidoController.removerItem);
vendasRoutes.patch("/:id/status", pedidoController.editarStatus);

export default vendasRoutes;