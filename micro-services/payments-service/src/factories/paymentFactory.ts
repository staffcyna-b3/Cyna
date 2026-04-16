import { PaymentService } from '../services/paymentService';
import { PaymentController } from '../controllers/paymentController';
import { OrderRepository } from '../repository/order.repository';
import { PaymentUserRepository } from '../repository/user.repository';
import { MailService } from '../services/mailService';

export function createPaymentController(): PaymentController {
  const orderRepository = new OrderRepository();
  const userRepository = new PaymentUserRepository();
  const mailService = new MailService();
  const paymentService = new PaymentService(orderRepository, userRepository, mailService);
  return new PaymentController(paymentService);
}

export function createPaymentService(): PaymentService {
  const orderRepository = new OrderRepository();
  const userRepository = new PaymentUserRepository();
  const mailService = new MailService();
  return new PaymentService(orderRepository, userRepository, mailService);
}
