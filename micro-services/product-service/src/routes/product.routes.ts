import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const productController = new ProductController();

router.get('/', (req: Request, res: Response) =>productController.listProducts(req, res));
router.get('/count', (req: Request, res: Response) => productController.countProducts(req, res));
router.get('/:id', (req: Request, res: Response) => productController.getProductById(req, res));

export default router;
