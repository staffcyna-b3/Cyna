import { Router } from 'express';
import { createSubscriptionController } from '../factories/subscription.factory';
import { internalAuthMiddleware } from '../middleware/internalAuth.middleware';

const router = Router();
const controller = createSubscriptionController();

router.post('/', (req, res) => controller.create(req, res));
router.patch('/status', internalAuthMiddleware, (req, res) => controller.updateStatus(req, res));

export default router;
