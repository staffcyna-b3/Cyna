import { PaymentService } from '../services/payment.service';
import { PaymentController } from '../controllers/payment.controller';
import { OrderRepository } from '../repository/order.repository';
import { UserRepository } from '../repository/user.repository';

export function createPaymentController(): PaymentController {
  const orderRepository = new OrderRepository();
  const userRepository = new UserRepository();
  const paymentService = new PaymentService(orderRepository, userRepository);
  return new PaymentController(paymentService);
}

export function createPaymentService(): PaymentService {
  const orderRepository = new OrderRepository();
  const userRepository = new UserRepository();
  return new PaymentService(orderRepository, userRepository);
}
