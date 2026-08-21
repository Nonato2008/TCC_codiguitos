import { Router } from "express";
import proprietariosController from "../controllers/proprietariosController.js";

const proprietarioRoutes = Router();

proprietarioRoutes.get("/:id", proprietariosController.selecionarId);
proprietarioRoutes.get("/", proprietariosController.selecionar);
proprietarioRoutes.put("/:id", proprietariosController.editar);
proprietarioRoutes.post("/", proprietariosController.criar);
proprietarioRoutes.delete("/:id", proprietariosController.deletar);

export default proprietarioRoutes;