import { Router } from 'express';
import { SalesController } from '../controllers/SalesController';
import { SalesService } from '../services/SalesService';
import { SalesRepository } from '../repository/sales.repository';

const router = Router();
const controller = new SalesController(new SalesService(new SalesRepository()));

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/dashboard/stats', (req, res) => controller.getDashboardStats(req, res));

export default router;
