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
const promoService = new PromoService(new PromoRepository());

const orderService = new OrderService(orderRepository, shippingService, promoService);
const checkoutService = new CheckoutService(cartRepository, addressRepository);

const orderController = new OrderController(orderService);
const checkoutController = new CheckoutController(checkoutService);

router.get('/checkout/context', (req, res) => checkoutController.getCheckoutContext(req, res));

router.get('/orders', (req, res) => orderController.getAll(req, res));
router.post('/orders', (req, res) => orderController.create(req, res));
router.get('/orders/:id', (req, res) => orderController.getById(req, res));
// Internal route — called by gateway Stripe webhook handler only, not exposed to frontend
router.patch('/orders/:id/status', internalAuthMiddleware, (req, res) => orderController.updateStatus(req, res));

export default router;
