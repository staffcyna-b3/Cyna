import { SubscriptionItem } from './SubscriptionItem.interface';

export interface IStripeSubscriptionService {
  createSubscription(
    subscriptionItems: SubscriptionItem[],
    oneTimeAmountCents: number,
    oneTimeDescription: string | undefined,
    userId: string,
    userEmail: string
  ): Promise<{ clientSecret: string; subscriptionId: string; paymentIntentId: string }>;
}
