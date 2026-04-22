import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { ProductRepository } from '../repository/product.repository';
import { IProductService } from '../interfaces/IProductService';
import { validatorSchema } from '../middlewares/validations';
import {
    createPhysicalSchema,
    createSaasSchema,
    maintenanceSchema,
    prioritySchema,
    productIdParamSchema,
    productListQuerySchema,
    reorderDisplayPrioritySchema,
    updateProductImageSchema,
    updateProductSchema,
    updateStockSchema,
} from '../schemas/product.schemas';

const router = Router();

const productRepository = new ProductRepository();
const productService: IProductService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/products', validatorSchema({ query: productListQuerySchema }), (req, res) => productController.list(req, res));
router.get('/products/:id', validatorSchema({ params: productIdParamSchema }), (req, res) => productController.getById(req, res));

router.post('/products/saas', validatorSchema({ body: createSaasSchema }), (req, res) => productController.createSaas(req, res));
router.post('/products/physical', validatorSchema({ body: createPhysicalSchema }), (req, res) => productController.createPhysical(req, res));

router.get('/products/:id/image', validatorSchema({ params: productIdParamSchema }), (req, res) => productController.getImage(req, res));
router.put('/products/:id/image', validatorSchema({ params: productIdParamSchema, body: updateProductImageSchema }), (req, res) => productController.updateImage(req, res));
router.put('/products/:id', validatorSchema({ params: productIdParamSchema, body: updateProductSchema }), (req, res) => productController.update(req, res));
router.delete('/products/:id', validatorSchema({ params: productIdParamSchema }), (req, res) => productController.remove(req, res));

router.patch('/products/:id/stock', validatorSchema({ params: productIdParamSchema, body: updateStockSchema }), (req, res) => productController.updateStock(req, res));
router.patch('/products/:id/maintenance', validatorSchema({ params: productIdParamSchema, body: maintenanceSchema }), (req, res) => productController.setMaintenance(req, res));
router.patch('/products/:id/priority', validatorSchema({ params: productIdParamSchema, body: prioritySchema }), (req, res) => productController.updatePriority(req, res));
router.patch('/products/display-priority', validatorSchema({ body: reorderDisplayPrioritySchema }), (req, res) => productController.reorderDisplayPriority(req, res));

export default router;
