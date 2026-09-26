import { Router } from "express";
import * as authController from "./auth.controller";
import { verifyJWT, verifyRefresh } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh", authController.refresh);

router.post("/logout", verifyRefresh, authController.logout);

router.post("/logout-all", verifyJWT, authController.logoutAll);

router.get("/me", verifyJWT, authController.me);

export default router;