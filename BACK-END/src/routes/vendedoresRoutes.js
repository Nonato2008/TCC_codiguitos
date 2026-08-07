import { Router } from "express";
import vendedoresController from "../controllers/vendedoresController";

const vendedoresRoutes = Router();

vendedoresRoutes.get("/:id", vendedoresController.selecionarId);
vendedoresRoutes.get("/", vendedoresController.selecionar);

export default vendedoresRoutes;