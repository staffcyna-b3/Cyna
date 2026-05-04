import { Router } from 'express';
import { SubscriptionAdminController } from '../controllers/SubscriptionAdminController';
import { SubscriptionAdminService } from '../services/SubscriptionAdminService';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { HttpClient } from '../infrastructure/HttpClient';

const router = Router();
const controller = new SubscriptionAdminController(
  new SubscriptionAdminService(new HttpClient(), new SubscriptionRepository())
);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/:id/cancel', (req, res) => controller.cancelById(req, res));

export default router;
