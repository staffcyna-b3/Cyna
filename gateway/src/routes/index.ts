import { Router } from 'express';
import backOfficeRoutes from './backOffice.routes';
import frontOfficeRoutes from './frontOffice.routes';
import productRoutes from './product.routes'
import paymentRoutes from './payments.routes';

const router = Router();

router.use('/back-office', backOfficeRoutes);
router.use('/front-office', frontOfficeRoutes);
router.use('/products', productRoutes)
router.use('/payments', paymentRoutes);

export default router;
