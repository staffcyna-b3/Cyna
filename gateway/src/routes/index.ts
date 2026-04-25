import { Router } from 'express';
import backOfficeRoutes from './backOffice.routes';
import frontOfficeRoutes from './frontOffice.routes';
import productRoutes from './product.routes';
// payments routes removed — /api/payments is now proxied to payments-service in app.ts

const router = Router();

router.use('/back-office', backOfficeRoutes);
router.use('/front-office', frontOfficeRoutes);
router.use('/products', productRoutes);

export default router;
