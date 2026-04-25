import { Router } from 'express';
import { SubscriptionLifecycleController } from '../controllers/subscriptionLifecycleController';
import { SubscriptionLifecycleService } from '../services/subscriptionLifecycleService';
import { stripe } from '../providers/stripe';

const router = Router();
const service = new SubscriptionLifecycleService(stripe);
const controller = new SubscriptionLifecycleController(service);

router.get('/:stripeCustomerId', (req, res) => controller.getByCustomerId(req, res));
router.post('/:stripeSubscriptionId/cancel', (req, res) => controller.cancelAtPeriodEnd(req, res));
router.post('/:stripeSubscriptionId/cancel-now', (req, res) => controller.cancelNow(req, res));

export default router;
