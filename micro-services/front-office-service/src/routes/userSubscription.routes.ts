import { Router } from 'express';
import { createUserSubscriptionController } from '../factories/subscription.factory';
import { requireUserHeader } from '../middlewares/requireUserHeader';

// Protégées par le gateway : authMiddleware + requireRole(USER) sur /api/front-office/**
// Le gateway injecte x-user-id après validation JWT — requireUserHeader valide et attache res.locals.userId.
const router = Router();
const controller = createUserSubscriptionController();

router.get('/', requireUserHeader, (req, res) => controller.getMySubscriptions(req, res));
router.get('/refund-requests', requireUserHeader, (req, res) => controller.getMyRefundRequests(req, res));
router.post('/:stripeSubscriptionId/cancel', requireUserHeader, (req, res) => controller.cancel(req, res));
router.post('/:stripeSubscriptionId/refund-request', requireUserHeader, (req, res) => controller.createRefundRequest(req, res));

export default router;