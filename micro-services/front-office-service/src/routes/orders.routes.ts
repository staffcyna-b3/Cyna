import { Router } from 'express';
import { OrderController } from '../controllers/orders.controller';
import { CheckoutController } from '../controllers/checkout.controller';
import { OrderRepository } from '../repository/orders.repository';
import { CartRepository } from '../repository/cart.repository';
import { AddressRepository } from '../repository/address.repository';
import { OrderService } from '../services/orders.service';
import { CheckoutService } from '../services/checkout.service';
import { AddressService } from '../services/address.service';
import { ShippingService } from '../services/shipping.service';
import { PromoService } from '../services/promo.service';
import { PromoRepository } from '../repository/promo.repository';
import { CartService } from '../services/cart.service';
import { ProductRepository } from '../repository/ProductRepository';
import { internalAuthMiddleware } from '../middleware/internalAuth.middleware';

/*
STRIPE INTEGRATION NOTE — for Marie
When a Stripe webhook confirms payment:
PATCH /orders/:id/status
Body: { "status": "PAID" }
When a Stripe webhook reports failure or refund:
PATCH /orders/:id/status
Body: { "status": "CANCELLED" }
Valid status values: PENDING | PAID | CANCELLED
This route has no user auth — gateway internal calls only.
Internal URL: http://front-office-service:<PORT>/orders/:id/status
*/

const router = Router();

const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();
const addressRepository = new AddressRepository();
const shippingService = new ShippingService();
const promoService = new PromoService(new PromoRepository(), new CartService(cartRepository, new ProductRepository(), shippingService));

const orderService = new OrderService(orderRepository, shippingService, promoService);
const checkoutService = new CheckoutService(cartRepository, addressRepository);

const orderController = new OrderController(orderService);
const checkoutController = new CheckoutController(checkoutService);

router.get('/checkout/context', (req, res) => checkoutController.getCheckoutContext(req, res));

router.get('/', (req, res) => orderController.getAll(req, res));
router.post('/', (req, res) => orderController.create(req, res));
router.get('/:id', (req, res) => orderController.getById(req, res));
// Internal route — called by gateway Stripe webhook handler only, not exposed to frontend
router.patch('/:id/status', internalAuthMiddleware, (req, res) => orderController.updateStatus(req, res));
// Internal route — called directly by payments-service webhook (no gateway)
router.patch('/by-payment-intent/:paymentIntentId/status', internalAuthMiddleware, (req, res) => orderController.updateStatusByPaymentIntent(req, res));
// Internal route — called by product-service via payments-service to resolve order items
router.get('/by-payment-intent/:paymentIntentId/items', internalAuthMiddleware, (req, res) => orderController.getItemsByPaymentIntent(req, res));

export default router;
