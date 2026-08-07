import { Router } from "express";
import vendedoresController from "../controllers/vendedoresController.js";

const vendedoresRoutes = Router();

//comentário para merge de emergência

vendedoresRoutes.get("/:id", vendedoresController.selecionarId);
vendedoresRoutes.post("/", vendedoresController.criar);
vendedoresRoutes.put("/:id", vendedoresController.editar);

export default vendedoresRoutes;