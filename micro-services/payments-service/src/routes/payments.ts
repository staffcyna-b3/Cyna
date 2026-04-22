import { Router } from 'express';
import { createPaymentController } from '../factories/paymentFactory';
import { validatorSchema } from '../middlewares/validateMiddleware';
import { createIntentSchema } from '../schemas/createIntentSchema';
import { createSubscriptionSchema } from '../schemas/createSubscriptionSchema';
import { getIntentParamsSchema } from '../schemas/getIntentParamsSchema';

const router = Router();
const paymentController = createPaymentController();

// POST /payments/create-intent
router.post(
    '/create-intent',
    validatorSchema({ body: createIntentSchema }),
    (req, res) => paymentController.createIntent(req, res),
);

// POST /payments/create-subscription
router.post(
    '/create-subscription',
    validatorSchema({ body: createSubscriptionSchema }),
    (req, res) => paymentController.createSubscription(req, res),
);

// GET /payments/intent/:id
router.get(
    '/intent/:id',
    validatorSchema({ params: getIntentParamsSchema }),
    (req, res) => paymentController.getIntent(req, res),
);

export default router;