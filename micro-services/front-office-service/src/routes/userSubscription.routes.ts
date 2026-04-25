import { Router } from 'express';
import { createUserSubscriptionController } from '../factories/subscription.factory';

const router = Router();
const controller = createUserSubscriptionController();

router.get('/', (req, res) => controller.getMySubscriptions(req, res));
router.post('/:stripeSubscriptionId/cancel', (req, res) => controller.cancel(req, res));
router.post('/:stripeSubscriptionId/refund-request', (req, res) => controller.createRefundRequest(req, res));

export default router;
