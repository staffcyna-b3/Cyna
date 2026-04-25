import { SubscriptionRepository } from '../repository/subscription.repository';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionController } from '../controllers/subscription.controller';
import { UserSubscriptionService } from '../services/userSubscription.service';
import { UserSubscriptionController } from '../controllers/userSubscription.controller';
import { RefundRequestRepository } from '../repository/refundRequest.repository';

export function createSubscriptionController(): SubscriptionController {
  const subscriptionRepository = new SubscriptionRepository();
  const subscriptionService = new SubscriptionService(subscriptionRepository);
  return new SubscriptionController(subscriptionService);
}

export function createUserSubscriptionController(): UserSubscriptionController {
  const refundRequestRepository = new RefundRequestRepository();
  const service = new UserSubscriptionService(refundRequestRepository);
  return new UserSubscriptionController(service);
}
