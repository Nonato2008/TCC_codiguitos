import { Router } from "express";
import pedidoController from "../controllers/pedidoController.js";

const pedidoRoutes = Router();


pedidoRoutes.post("/", pedidoController.criar);
pedidoRoutes.get("/", pedidoController.selecionar);
pedidoRoutes.get("/:id", pedidoController.selecionar);
pedidoRoutes.put("/:id", pedidoController.editar);
pedidoRoutes.delete("/:id", pedidoController.deletar);
pedidoRoutes.post("/:id/item", pedidoController.adicionarItem);
pedidoRoutes.put("/:id/item/:itemId", pedidoController.editarItem);
pedidoRoutes.delete("/:id/item/:itemId", pedidoController.removerItem);
pedidoRoutes.patch("/:id/status", pedidoController.editarStatus);

export default pedidoRoutes;