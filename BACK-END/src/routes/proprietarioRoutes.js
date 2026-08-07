import { Router } from "express";
import proprietariosController from "../controllers/proprietariosController.js";

const proprietarioRoutes = Router();

proprietarioRoutes.get("/:id", proprietariosController.selecionarId);
proprietarioRoutes.put("/:id", proprietariosController.editar);
proprietarioRoutes.post("/", proprietariosController.criar);

export default proprietarioRoutes;