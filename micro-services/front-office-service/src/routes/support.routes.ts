import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { SupportService } from '../services/support.service';
import { SupportRepository } from '../repository/support.repository';
import { MailService } from '../services/mail.service';

const router = Router();

const repository = new SupportRepository();
const mailService = new MailService();
const service = new SupportService(repository, mailService);
const controller = new SupportController(service);

router.post('/', (req, res) => controller.submit(req, res));

export default router;
