import { Router } from "express";
import proprietariosController from "../controllers/proprietariosController.js";

const proprietarioRoutes = Router();

proprietarioRoutes.get("/:id", proprietariosController.selecionarId);

export default proprietarioRoutes;