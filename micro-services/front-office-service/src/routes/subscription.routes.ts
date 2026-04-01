import { Router } from 'express';
import { createSubscriptionController } from '../factories/subscription.factory';

const router = Router();
const controller = createSubscriptionController();

router.post('/', (req, res) => controller.create(req, res));
router.patch('/status', (req, res) => controller.updateStatus(req, res));

export default router;
