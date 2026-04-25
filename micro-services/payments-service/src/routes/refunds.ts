import { Router } from 'express';
import { SubscriptionLifecycleController } from '../controllers/subscriptionLifecycleController';
import { SubscriptionLifecycleService } from '../services/subscriptionLifecycleService';
import { stripe } from '../providers/stripe';

const router = Router();
const service = new SubscriptionLifecycleService(stripe);
const controller = new SubscriptionLifecycleController(service);

router.post('/', (req, res) => controller.createRefund(req, res));

export default router;
