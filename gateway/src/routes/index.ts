import { Router } from 'express';
import authRoutes from './auth.routes';
import backOfficeRoutes from './backOffice.routes';
import frontOfficeRoutes from './frontOffice.routes';
import productRoutes from './product.routes'

const router = Router();

router.use('/auth', authRoutes);
router.use('/back-office', backOfficeRoutes);
router.use('/front-office', frontOfficeRoutes);
router.use('/products', productRoutes)

export default router;
