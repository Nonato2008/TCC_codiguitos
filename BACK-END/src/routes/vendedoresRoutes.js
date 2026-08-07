import { Router } from "express";
import vendedoresController from "../controllers/vendedoresController.js";

const vendedoresRoutes = Router();

vendedoresRoutes.get("/:id", vendedoresController.selecionarId);

export default vendedoresRoutes;