import { Router } from "express";
import itensVendasController from "../controllers/itensVendasController";

const itensVendasRoutes = Router();

itensVendasRoutes.get("/:id", itensVendasController.selecionarId);

export default itensVendasRoutes;