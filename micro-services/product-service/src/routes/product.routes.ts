import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import ProductService from '../services/product.service';
import ProductRepository from '../repository/product.repository';

const router = Router();
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.post('/payment-notification', (req: Request, res: Response) => productController.handleTransaction(req, res));
router.get('/suggestions', (req: Request, res: Response) => productController.getProductSuggestions(req, res));
router.get('', (req: Request, res: Response) => productController.listProducts(req, res));
router.get('/count', (req: Request, res: Response) => productController.countProducts(req, res));
router.get('/similar/:id', (req: Request, res: Response) => productController.getSimilarProducts(req, res));
router.get('/:id', (req: Request, res: Response) => productController.getProductById(req, res));

export default router;
