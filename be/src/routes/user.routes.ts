import { Router } from "express";
import { authMiddleware } from "../modules/auth/auth.middleware";
import { userController } from "../modules/user/user.controller";

const router = Router();

router.get("/me", authMiddleware, userController.getMe);

export default router;
