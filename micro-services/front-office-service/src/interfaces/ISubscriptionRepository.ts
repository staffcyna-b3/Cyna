import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { CreateSubscriptionBody } from './CreateSubscriptionBody';

export interface ISubscriptionRepository {
  createMany(body: CreateSubscriptionBody): Promise<number>;
  updateStatusByStripeId(stripeSubscriptionId: string, status: SubscriptionStatus): Promise<number>;
}
