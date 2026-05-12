import { Router } from 'express';
import { GatewayController } from '../controllers/gateway.controller';
import { MicroServiceEnum } from '../enum/microService.enum';
import { authMiddleware } from '../middlewares/auth.middleware';
import { optionalAuth } from '../middlewares/optional-auth.middleware';
import { requireRole } from '../middlewares/role.guard';
import { contactLimiter } from '../middlewares/rate-limit.middleware';
import { UserRoleType } from '../enum/UserRoleType.enum';

const router = Router();
const controller = new GatewayController();

// Route publique — panier 
router.use('/cart', optionalAuth, (req, res) => controller.proxy(req, res, MicroServiceEnum.FRONTOFFICE));

// Route publique — formulaire de contact
router.post('/support', contactLimiter, (req, res) => controller.proxy(req, res, MicroServiceEnum.FRONTOFFICE));
router.use('/support', (req, res) => controller.proxy(req, res, MicroServiceEnum.FRONTOFFICE));

// Toutes les autres routes front-office nécessitent d'être connecté
router.use(authMiddleware, requireRole(UserRoleType.USER, UserRoleType.ADMIN, UserRoleType.COMMERCIAL));
router.use((req, res) => controller.proxy(req, res, MicroServiceEnum.FRONTOFFICE));

export default router;
