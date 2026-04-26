import { Router } from 'express';
import { SupportController } from '../controllers/SupportController';
import { SupportService } from '../services/SupportService';
import { SupportRepository } from '../repositories/SupportRepository';

const router = Router();

const repository = new SupportRepository();
const service = new SupportService(repository);
const controller = new SupportController(service);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.patch('/:id/processed', (req, res) => controller.markAsProcessed(req, res));

export default router;
