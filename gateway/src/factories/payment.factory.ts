import { PaymentService } from '../services/payment.service';
import { PaymentController } from '../controllers/payment.controller';
import { OrderRepository } from '../repository/order.repository';
import { UserRepository } from '../repository/user.repository';
import { MailService } from '../services/mail.service';

export function createPaymentController(): PaymentController {
  const orderRepository = new OrderRepository();
  const userRepository = new UserRepository();
  const mailService = new MailService();
  const paymentService = new PaymentService(orderRepository, userRepository, mailService);
  return new PaymentController(paymentService);
}

export function createPaymentService(): PaymentService {
  const orderRepository = new OrderRepository();
  const userRepository = new UserRepository();
  const mailService = new MailService();
  return new PaymentService(orderRepository, userRepository, mailService);
}
