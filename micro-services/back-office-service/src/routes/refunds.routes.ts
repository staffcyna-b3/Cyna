import { Router } from 'express';
import { RefundController } from '../controllers/RefundController';
import { RefundService } from '../services/RefundService';
import { HttpClient } from '../infrastructure/HttpClient';

const router = Router();
const controller = new RefundController(new RefundService(new HttpClient()));

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));

export default router;
