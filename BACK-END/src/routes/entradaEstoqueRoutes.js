import { Router } from "express";

import entradaEstoqueController
    from "../controllers/entradaEstoqueController.js";

const router = Router();

router.post(
    "/",
    entradaEstoqueController.registrarEntrada
);

export default router;