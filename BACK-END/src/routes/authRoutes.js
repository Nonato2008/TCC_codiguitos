import { Router } from "express";
import authController from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/cadastro", authController.cadastro);

export default authRoutes;