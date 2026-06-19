import { Router } from 'express';
import { taskController } from '../modules/task/task.controller';
import { authMiddleware, requireAdmin } from '../modules/auth/auth.middleware';

const router = Router();

// Require authorization for all task routes
router.use(authMiddleware);

router.get('/', taskController.list);
router.post('/', taskController.create);
router.put('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.delete);

// Static routes must come BEFORE dynamic parameter routes
router.get('/global-audit-logs', requireAdmin, taskController.getGlobalLogs);
router.get('/:id/audit-logs', taskController.getLogs);

export default router;
