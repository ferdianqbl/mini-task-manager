import { Router } from 'express';
import { userController } from '../modules/user/user.controller';
import { authMiddleware } from '../modules/auth/auth.middleware';

const router = Router();

router.get('/me', authMiddleware, userController.getMe);

export default router;
