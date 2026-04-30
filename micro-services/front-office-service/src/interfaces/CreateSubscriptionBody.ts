import { CreateSubscriptionItem } from './CreateSubscriptionItem';

export interface CreateSubscriptionBody {
  stripeSubscriptionId: string;
  userId: string;
  items: CreateSubscriptionItem[];
  startDate: string;
  endDate: string;
}