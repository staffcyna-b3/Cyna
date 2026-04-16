import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { ProductRepository } from '../repository/product.repository';
import { IProductService } from '../interfaces/IProductService';

const router = Router();

const productRepository = new ProductRepository();
const productService: IProductService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/products', (req, res) => productController.list(req, res));
router.get('/products/:id', (req, res) => productController.getById(req, res));

router.post('/products/saas', (req, res) => productController.createSaas(req, res));
router.post('/products/physical', (req, res) => productController.createPhysical(req, res));

router.get('/products/:id/image', (req, res) => productController.getImage(req, res));
router.put('/products/:id/image', (req, res) => productController.updateImage(req, res));
router.put('/products/:id', (req, res) => productController.update(req, res));
router.delete('/products/:id', (req, res) => productController.remove(req, res));

router.patch('/products/:id/stock', (req, res) => productController.updateStock(req, res));
router.patch('/products/:id/maintenance', (req, res) => productController.setMaintenance(req, res));
router.patch('/products/:id/priority', (req, res) => productController.updatePriority(req, res));
router.patch('/products/display-priority', (req, res) => productController.reorderDisplayPriority(req, res));

export default router;
