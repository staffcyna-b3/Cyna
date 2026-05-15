import { PaymentController } from '../controllers/paymentController';
import { PaymentIntentService } from '../services/paymentIntentService';
import { StripeSubscriptionService } from '../services/stripeSubscriptionService';
import { WebhookService } from '../services/webhookService';
import { OrderRepository } from '../repositories/order.repository';
import { PaymentUserRepository } from '../repositories/user.repository';
import { MailService } from '../services/mailService';
import { stripe } from '../providers/stripe';
import { AxiosHttpClient } from '../providers/httpClient';

export function createPaymentController(): PaymentController {
  const orderRepository = new OrderRepository();
  const userRepository = new PaymentUserRepository();
  const httpClient = new AxiosHttpClient();

  const paymentIntentService = new PaymentIntentService(orderRepository, stripe);
  const subscriptionService = new StripeSubscriptionService(orderRepository, userRepository, stripe, httpClient);

  return new PaymentController(paymentIntentService, subscriptionService);
}

export function createWebhookService(): WebhookService {
  const orderRepository = new OrderRepository();
  const userRepository = new PaymentUserRepository();
  const mailService = new MailService();
  const httpClient = new AxiosHttpClient();

  return new WebhookService(orderRepository, userRepository, mailService, stripe, httpClient);
}
