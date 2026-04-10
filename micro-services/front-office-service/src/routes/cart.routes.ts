import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { CartService } from '../services/cart.service';
import { CartRepository } from '../repository/cart.repository';
import { ProductRepository } from '../repository/ProductRepository';
const router = Router();

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const cartService = new CartService(cartRepository, productRepository);
const cartController = new CartController(cartService);

router.get('/', (req, res) => cartController.getCart(req, res));
router.post('/items', (req, res) => cartController.addToCart(req, res));
router.patch('/items/:itemId', (req, res) => cartController.updateCartItem(req, res));
router.delete('/items/:itemId', (req, res) => cartController.removeFromCart(req, res));
router.delete('/', (req, res) => cartController.clearCart(req, res));

export default router;
