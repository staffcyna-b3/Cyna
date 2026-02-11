import { Router } from 'express';
import { GatewayController } from '../controllers/gateway.controller';
import { MicroServiceEnum } from '../enum/microService.enum';

const router = Router();
const controller = new GatewayController();


router.get('/', (req, res) => controller.proxy(req, res, MicroServiceEnum.BACKOFFICE));

export default router;
