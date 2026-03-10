import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res) => authController.login(req, res));
router.get('/verify-remember-me', (req, res) => authController.verifyRememberMe(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/confirm-email', (req, res) => authController.confirmEmail(req, res));
router.post('/request-reset', (req, res) => authController.requestPasswordReset(req, res));
router.get('/validate-reset-token', (req, res) => authController.validateResetToken(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/verify-2fa', (req, res) => authController.verify2FA(req, res));

export default router;
