import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { PromotionService } from '../services/promotion.service';
import { PromotionRepository } from '../repositories/promotion.repository';
import { ProductRepository } from '../repositories/product.repository';
import { IPromotionService } from '../interfaces/IPromotionService';
import { validatorSchema } from '../middlewares/validations';
import {
    createPromotionSchema,
    productIdParamSchema,
    promotionIdParamSchema,
    promotionProductIdsSchema,
    setActiveSchema,
    updatePromotionSchema,
} from '../schemas/promotion.schemas';

const router = Router();

const promotionRepository = new PromotionRepository();
const productRepository = new ProductRepository();
const promotionService: IPromotionService = new PromotionService(promotionRepository, productRepository);
const promotionController = new PromotionController(promotionService);

router.get('/', (req, res) => promotionController.list(req, res));
router.get('/:id', validatorSchema({ params: promotionIdParamSchema }), (req, res) => promotionController.getById(req, res));

router.post('/', validatorSchema({ body: createPromotionSchema }), (req, res) => promotionController.create(req, res));
router.put('/:id', validatorSchema({ params: promotionIdParamSchema, body: updatePromotionSchema }), (req, res) => promotionController.update(req, res));
router.delete('/:id', validatorSchema({ params: promotionIdParamSchema }), (req, res) => promotionController.remove(req, res));

router.patch('/:id/active', validatorSchema({ params: promotionIdParamSchema, body: setActiveSchema }), (req, res) => promotionController.setActive(req, res));
router.put('/:id/products', validatorSchema({ params: promotionIdParamSchema, body: promotionProductIdsSchema }), (req, res) => promotionController.replaceProducts(req, res));
router.post('/:id/products', validatorSchema({ params: promotionIdParamSchema, body: promotionProductIdsSchema }), (req, res) => promotionController.addProducts(req, res));
router.delete('/:id/products/:productId', validatorSchema({ params: { ...promotionIdParamSchema, ...productIdParamSchema } }), (req, res) => promotionController.removeProduct(req, res));

export default router;
    