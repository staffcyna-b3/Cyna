import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { TransactionService } from '../services/TransactionService';
import { HttpClient } from '../infrastructure/HttpClient';

const router = Router();
const controller = new TransactionController(new TransactionService(new HttpClient()));

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/:paymentIntentId/refund', (req, res) => controller.refund(req, res));

export default router;
