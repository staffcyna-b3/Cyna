import { Router } from 'express';
import { RefundRequestAdminController } from '../controllers/RefundRequestAdminController';
import { RefundRequestAdminService } from '../services/RefundRequestAdminService';
import { HttpClient } from '../infrastructure/HttpClient';

const router = Router();
const controller = new RefundRequestAdminController(new RefundRequestAdminService(new HttpClient()));

router.get('/', (req, res) => controller.getAll(req, res));
router.patch('/:id', (req, res) => controller.updateStatus(req, res));

export default router;
