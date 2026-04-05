import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { CartService } from '../services/cart.service';
import { CartRepository } from '../repository/cart.repository';

const router = Router();

const cartRepository = new CartRepository();
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

router.get('/cart', (req, res) => cartController.getCart(req, res));
router.post('/cart/items', (req, res) => cartController.addToCart(req, res));
router.put('/cart/items/:itemId', (req, res) => cartController.updateCartItem(req, res));
router.delete('/cart/items/:itemId', (req, res) => cartController.removeFromCart(req, res));

export default router; 