import { Router } from "express";
import authRoutes from "./auth.routes";
import taskRoutes from "./task.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

export default router;
