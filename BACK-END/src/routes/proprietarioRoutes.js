import { Router } from "express";
import proprietariosController from "../controllers/proprietariosController";

const proprietarioRoutes = Router();

proprietarioRoutes.get("/:id", proprietariosController.selecionarId);
proprietarioRoutes.get("/", proprietariosController.selecionar);

export default proprietarioRoutes;