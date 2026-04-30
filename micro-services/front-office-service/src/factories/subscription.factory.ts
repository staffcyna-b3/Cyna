import { SubscriptionRepository } from '../repository/subscription.repository';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionController } from '../controllers/subscription.controller';

export function createSubscriptionController(): SubscriptionController {
  const subscriptionRepository = new SubscriptionRepository();
  const subscriptionService = new SubscriptionService(subscriptionRepository);
  return new SubscriptionController(subscriptionService);
}
