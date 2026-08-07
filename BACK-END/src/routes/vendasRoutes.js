import { Router } from "express";
import vendaController from "../controllers/vendasController.js";

const vendasRoutes = Router();


// Rota para criar uma nova venda
vendasRoutes.post("/", vendaController.criar);
vendasRoutes.get("/", vendaController.selecionar);
vendasRoutes.get("/:id", vendaController.selecionarId);
vendasRoutes.put("/:id", vendaController.editar);
vendasRoutes.delete("/:id", vendaController.deletar);
vendasRoutes.post("/:id/item", vendaController.adicionarItem);
vendasRoutes.put("/:id/item/:itemId", vendaController.editarItem);
vendasRoutes.delete("/:id/item/:itemId", vendaController.removerItem);
vendasRoutes.patch("/:id/status", vendaController.editarStatus);

export default vendasRoutes;