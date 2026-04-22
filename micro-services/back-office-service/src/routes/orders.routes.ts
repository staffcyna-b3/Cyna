import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../services/OrderService';
import { OrderRepository } from '../repositories/OrderRepository';

const router = Router();
const controller = new OrderController(new OrderService(new OrderRepository()));

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.patch('/:id/status', (req, res) => controller.updateStatus(req, res));

export default router;
