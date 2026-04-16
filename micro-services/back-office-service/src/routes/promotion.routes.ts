import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { PromotionService } from '../services/promotion.service';
import { PromotionRepository } from '../repository/promotion.repository';
import { IPromotionService } from '../interfaces/IPromotionService';

const router = Router();

const promotionRepository = new PromotionRepository();
const promotionService: IPromotionService = new PromotionService(promotionRepository);
const promotionController = new PromotionController(promotionService);

router.get('/promotions', (req, res) => promotionController.list(req, res));
router.get('/promotions/:id', (req, res) => promotionController.getById(req, res));

router.post('/promotions', (req, res) => promotionController.create(req, res));
router.put('/promotions/:id', (req, res) => promotionController.update(req, res));
router.delete('/promotions/:id', (req, res) => promotionController.remove(req, res));

router.patch('/promotions/:id/active', (req, res) => promotionController.setActive(req, res));
router.put('/promotions/:id/products', (req, res) => promotionController.replaceProducts(req, res));
router.post('/promotions/:id/products', (req, res) => promotionController.addProducts(req, res));
router.delete('/promotions/:id/products/:productId', (req, res) => promotionController.removeProduct(req, res));

export default router;
