import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';

const router = Router();
const controller = new UserController(new UserService(new UserRepository()));

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));

export default router;
