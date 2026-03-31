import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();
const controller = new SubscriptionController();

router.post('/', (req, res) => controller.create(req, res));
router.patch('/status', (req, res) => controller.updateStatus(req, res));

export default router;
