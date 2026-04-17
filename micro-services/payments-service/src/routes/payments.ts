import { Router } from 'express';
import { createPaymentController } from '../factories/paymentFactory';
import { requireAuth } from '../middlewares/requireAuth.middleware';
import { validateSubscriptionItems } from '../middlewares/validateSubscriptionItems.middleware';

const router = Router();
const paymentController = createPaymentController();

// POST /payments/create-intent
router.post('/create-intent', requireAuth, (req, res, next) =>
  paymentController.createIntent(req, res, next)
);

// POST /payments/create-subscription
router.post('/create-subscription', requireAuth, validateSubscriptionItems, (req, res, next) =>
  paymentController.createSubscription(req, res, next)
);

// GET /payments/intent/:id
router.get('/intent/:id', requireAuth, (req, res, next) =>
  paymentController.getIntent(req, res, next)
);

export default router;
