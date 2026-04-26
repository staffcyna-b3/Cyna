import { Router } from 'express';
import { createUserSubscriptionController } from '../factories/subscription.factory';

// Protégées par le gateway : authMiddleware + requireRole(USER) sur /api/front-office/**
// Le gateway injecte x-user-id après validation JWT — le controller l'extrait depuis ce header.
const router = Router();
const controller = createUserSubscriptionController();

router.get('/', (req, res) => controller.getMySubscriptions(req, res));
router.get('/refund-requests', (req, res) => controller.getMyRefundRequests(req, res));
router.post('/:stripeSubscriptionId/cancel', (req, res) => controller.cancel(req, res));
router.post('/:stripeSubscriptionId/refund-request', (req, res) => controller.createRefundRequest(req, res));

export default router;
