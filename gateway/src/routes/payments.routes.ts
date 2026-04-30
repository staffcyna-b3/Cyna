import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createPaymentIntentLimiter } from '../middlewares/rate-limit.middleware';
import { createPaymentController } from '../factories/payment.factory';

const router = Router();
const paymentController = createPaymentController();

router.post('/create-intent', authMiddleware, createPaymentIntentLimiter, (req, res, next) =>
  paymentController.createIntent(req, res, next)
);

router.post('/create-subscription', authMiddleware, createPaymentIntentLimiter, (req, res, next) =>
  paymentController.createSubscription(req, res, next)
);

router.get('/intent/:id', authMiddleware, (req, res, next) =>
  paymentController.getIntent(req, res, next)
);

export default router;
