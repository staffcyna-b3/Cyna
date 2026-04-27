import { SubscriptionStatus } from '../enum/SubscriptionStatus';
import { CreateSubscriptionBody } from './CreateSubscriptionBody';
import Subscription from '../models/Subscription';

export interface ISubscriptionRepository {
  createMany(body: CreateSubscriptionBody): Promise<number>;
  updateStatusByStripeId(stripeSubscriptionId: string, status: SubscriptionStatus): Promise<number>;
  findByUserId(userId: string): Promise<Subscription[]>;
  findByStripeId(stripeId: string): Promise<Subscription | null>;
}