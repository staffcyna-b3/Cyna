import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { SupportService } from '../services/support.service';
import { SupportRepository } from '../repositories/support.repository';
import { MailService } from '../services/mail.service';

const router = Router();

const mailService = new MailService();
const repository = new SupportRepository();
const service = new SupportService(repository, mailService);
const controller = new SupportController(service);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.patch('/:id/processed', (req, res) => controller.markAsProcessed(req, res));
router.post('/:id/reply', (req, res) => controller.reply(req, res));

export default router;
