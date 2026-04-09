import { Router } from 'express';
import { GatewayController } from '../controllers/gateway.controller';
import { MicroServiceEnum } from '../enum/microService.enum';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new GatewayController();

router.use(authMiddleware);

router.all('/{*path}', (req, res) => controller.proxy(req, res, MicroServiceEnum.FRONTOFFICE));

export default router;
