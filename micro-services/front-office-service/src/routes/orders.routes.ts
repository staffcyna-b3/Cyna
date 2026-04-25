import { Router } from 'express';
import { OrderController } from '../controllers/orders.controller';
import { CheckoutController } from '../controllers/checkout.controller';
import { AddressesController } from '../controllers/addresses.controller';
import { OrderRepository } from '../repository/orders.repository';
import { CartRepository } from '../repository/cart.repository';
import { AddressRepository } from '../repository/address.repository';
import { OrderService } from '../services/orders.service';
import { CheckoutService } from '../services/checkout.service';
import { AddressService } from '../services/address.service';

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

const orderService = new OrderService(orderRepository);
const checkoutService = new CheckoutService(cartRepository, addressRepository);
const addressService = new AddressService(addressRepository);

const orderController = new OrderController(orderService);
const checkoutController = new CheckoutController(checkoutService);
const addressesController = new AddressesController(addressService);

router.get('/addresses', (req, res) => addressesController.getAddresses(req, res));
router.put('/addresses', (req, res) => addressesController.upsertAddresses(req, res));
router.get('/checkout/context', (req, res) => checkoutController.getCheckoutContext(req, res));

router.post('/orders', (req, res) => orderController.create(req, res));
router.get('/orders/:id', (req, res) => orderController.getById(req, res));
// Internal route — called by gateway Stripe webhook handler only, not exposed to frontend
router.patch('/orders/:id/status', (req, res) => orderController.updateStatus(req, res));

export default router;
