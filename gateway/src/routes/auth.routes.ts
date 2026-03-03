import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res) => authController.login(req, res));
router.get('/verify-remember-me', (req, res) => authController.verifyRememberMe(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/register', (req, res) => authController.register(req, res));

export default router;
