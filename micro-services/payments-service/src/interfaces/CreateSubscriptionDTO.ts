import { SubscriptionItem } from './SubscriptionItem.interface';

export interface CreateSubscriptionDTO {
  subscriptionItems: SubscriptionItem[];
  oneTimeAmountCents?: number;
  oneTimeDescription?: string;
}
