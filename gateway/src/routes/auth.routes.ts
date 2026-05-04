import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  loginLimiter,
  verify2FALimiter,
  registerLimiter,
  passwordResetLimiter,
} from '../middlewares/rate-limit.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  // Rate limiting appliqué sur les routes sensibles
  router.post('/login', loginLimiter, (req, res) => authController.login(req, res));
  router.get('/verify-remember-me', (req, res) => authController.verifyRememberMe(req, res));
  router.post('/logout', (req, res) => authController.logout(req, res));
  router.post('/register', registerLimiter, (req, res) => authController.register(req, res));
  router.post('/confirm-email', (req, res) => authController.confirmEmail(req, res));
  router.post('/request-reset', passwordResetLimiter, (req, res) =>
    authController.requestPasswordReset(req, res)
  );
  router.post('/validate-reset-token', (req, res) => authController.validateResetToken(req, res));
  router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
  router.post('/verify-2fa', verify2FALimiter, (req, res) => authController.verify2FA(req, res));

  //Refresh
  router.post('/refresh', (req, res) => authController.refresh(req, res))
  router.get('/me', authMiddleware, (req, res) => authController.me(req, res))
  router.patch('/me', authMiddleware, (req, res) => authController.updateMe(req, res))
  router.patch('/password', authMiddleware, (req, res) => authController.changePassword(req, res))

  return router;
};
