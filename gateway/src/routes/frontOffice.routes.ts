import { Router } from 'express';
import { GatewayController } from '../controllers/gateway.controller';
import { MicroServiceEnum } from '../enum/microService.enum';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.guard';
import { UserRoleType } from '../enum/UserRoleType.enum';

const router = Router();
const controller = new GatewayController();

router.all('/{*path}', (req, res) => controller.proxy(req, res, MicroServiceEnum.FRONTOFFICE));

export default router;
