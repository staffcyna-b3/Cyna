import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { PromoController } from '../controllers/promo.controller';
import { CartService } from '../services/cart.service';
import { ShippingService } from '../services/shipping.service';
import { PromoService } from '../services/promo.service';
import { CartRepository } from '../repository/cart.repository';
import { ProductRepository } from '../repository/ProductRepository';
const router = Router();

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const shippingService = new ShippingService();
const promoService = new PromoService();
const cartService = new CartService(cartRepository, productRepository, shippingService);
const cartController = new CartController(cartService);
const promoController = new PromoController(promoService, cartService);

router.get('/', (req, res) => cartController.getCart(req, res));
router.post('/items', (req, res) => cartController.addToCart(req, res));
router.patch('/items/:itemId', (req, res) => cartController.updateCartItem(req, res));
router.delete('/items/:itemId', (req, res) => cartController.removeFromCart(req, res));
router.delete('/', (req, res) => cartController.clearCart(req, res));
router.post('/promo', (req, res) => promoController.applyPromo(req, res));

export default router;
