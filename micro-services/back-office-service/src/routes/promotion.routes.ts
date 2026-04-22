import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { PromotionService } from '../services/promotion.service';
import { PromotionRepository } from '../repository/promotion.repository';
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
const promotionService: IPromotionService = new PromotionService(promotionRepository);
const promotionController = new PromotionController(promotionService);

router.get('/promotions', (req, res) => promotionController.list(req, res));
router.get('/promotions/:id', validatorSchema({ params: promotionIdParamSchema }), (req, res) => promotionController.getById(req, res));

router.post('/promotions', validatorSchema({ body: createPromotionSchema }), (req, res) => promotionController.create(req, res));
router.put('/promotions/:id', validatorSchema({ params: promotionIdParamSchema, body: updatePromotionSchema }), (req, res) => promotionController.update(req, res));
router.delete('/promotions/:id', validatorSchema({ params: promotionIdParamSchema }), (req, res) => promotionController.remove(req, res));

router.patch('/promotions/:id/active', validatorSchema({ params: promotionIdParamSchema, body: setActiveSchema }), (req, res) => promotionController.setActive(req, res));
router.put('/promotions/:id/products', validatorSchema({ params: promotionIdParamSchema, body: promotionProductIdsSchema }), (req, res) => promotionController.replaceProducts(req, res));
router.post('/promotions/:id/products', validatorSchema({ params: promotionIdParamSchema, body: promotionProductIdsSchema }), (req, res) => promotionController.addProducts(req, res));
router.delete('/promotions/:id/products/:productId', validatorSchema({ params: { ...promotionIdParamSchema, ...productIdParamSchema } }), (req, res) => promotionController.removeProduct(req, res));

export default router;
