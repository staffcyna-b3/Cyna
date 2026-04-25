import { Router } from 'express';
import { SubscriptionAdminController } from '../controllers/SubscriptionAdminController';
import { SubscriptionAdminService } from '../services/SubscriptionAdminService';
import { HttpClient } from '../infrastructure/HttpClient';

const router = Router();
const controller = new SubscriptionAdminController(new SubscriptionAdminService(new HttpClient()));

router.post('/:stripeSubscriptionId/cancel', (req, res) => controller.cancelNow(req, res));

export default router;
