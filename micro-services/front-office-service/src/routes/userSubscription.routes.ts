import { Router } from 'express';
import { createUserSubscriptionController } from '../factories/subscription.factory';
import { requireRoles } from '../middlewares/requireRoles';

const router = Router();
const controller = createUserSubscriptionController();

router.get('/', requireRoles(['user']), (req, res) => controller.getMySubscriptions(req, res));
router.get('/refund-requests', requireRoles(['user']), (req, res) => controller.getMyRefundRequests(req, res));
router.post('/:stripeSubscriptionId/cancel', requireRoles(['user']), (req, res) => controller.cancel(req, res));
router.post('/:stripeSubscriptionId/reactivate', requireRoles(['user']), (req, res) => controller.reactivate(req, res));
router.post('/:stripeSubscriptionId/refund-request', requireRoles(['user']), (req, res) => controller.createRefundRequest(req, res));

export default router;