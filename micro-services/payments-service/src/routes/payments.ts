import { Router } from 'express';
import { createPaymentController } from '../factories/paymentFactory';

const router = Router();
const paymentController = createPaymentController();

// POST /payments/create-intent
router.post('/create-intent', (req, res, next) =>
  paymentController.createIntent(req, res, next)
);

// POST /payments/create-subscription
router.post('/create-subscription', (req, res, next) =>
  paymentController.createSubscription(req, res, next)
);

// GET /payments/intent/:id
router.get('/intent/:id', (req, res, next) =>
  paymentController.getIntent(req, res, next)
);

export default router;
