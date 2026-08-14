import { Router } from "express";
import itensVendasController from "../controllers/itensVendasController.js";

const itensVendasRoutes = Router();

itensVendasRoutes.get("/:id", itensVendasController.selecionarId);

export default itensVendasRoutes;