import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionController } from '../controllers/subscription.controller';
import { UserSubscriptionService } from '../services/userSubscription.service';
import { UserSubscriptionController } from '../controllers/userSubscription.controller';
import { RefundRequestRepository } from '../repositories/refundRequest.repository';

export function createSubscriptionController(): SubscriptionController {
  const subscriptionRepository = new SubscriptionRepository();
  const subscriptionService = new SubscriptionService(subscriptionRepository);
  return new SubscriptionController(subscriptionService);
}

export function createUserSubscriptionController(): UserSubscriptionController {
  const subscriptionRepository = new SubscriptionRepository();
  const refundRequestRepository = new RefundRequestRepository();
  const service = new UserSubscriptionService(subscriptionRepository, refundRequestRepository);
  return new UserSubscriptionController(service);
}