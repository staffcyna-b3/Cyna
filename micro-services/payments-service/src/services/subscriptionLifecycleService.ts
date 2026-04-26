import Stripe from 'stripe';
import { IStripeClient } from '../interfaces/IStripeClient';
import { handleStripeError } from '../utils/paymentUtils';
import { Logger } from '../common/logger';

export class SubscriptionLifecycleService {
  constructor(private readonly stripeClient: IStripeClient) {}

  async getByCustomerId(stripeCustomerId: string): Promise<Stripe.Subscription[]> {
    let result!: Stripe.ApiList<Stripe.Subscription>;
    try {
      result = await this.stripeClient.subscriptions.list({ customer: stripeCustomerId });
    } catch (error) {
      handleStripeError(error);
    }
    Logger.info('[SUBSCRIPTION] Listed subscriptions for customer', { stripeCustomerId });
    return result.data;
  }

  async cancelAtPeriodEnd(subscriptionId: string): Promise<Stripe.Subscription> {
    let subscription!: Stripe.Subscription;
    try {
      subscription = await this.stripeClient.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      handleStripeError(error);
    }
    Logger.info('[SUBSCRIPTION] Scheduled cancel at period end', { subscriptionId });
    return subscription;
  }

  async cancelNow(subscriptionId: string): Promise<Stripe.Subscription> {
    let subscription!: Stripe.Subscription;
    try {
      subscription = await this.stripeClient.subscriptions.cancel(subscriptionId);
    } catch (error) {
      handleStripeError(error);
    }
    Logger.info('[SUBSCRIPTION] Cancelled immediately', { subscriptionId });
    return subscription;
  }

  async listRefunds(limit: number = 100): Promise<Stripe.Refund[]> {
    let result!: Stripe.ApiList<Stripe.Refund>;
    try {
      result = await this.stripeClient.refunds.list({ limit });
    } catch (error) {
      handleStripeError(error);
    }
    return result.data;
  }

  async resolvePaymentIntentForSubscription(subscriptionId: string): Promise<string | null> {
    const results = await this.stripeClient.paymentIntents.search({
      query: `metadata['subscriptionId']:'${subscriptionId}' AND status:'succeeded'`,
      limit: 1,
    });
    return results.data[0]?.id ?? null;
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    let refund!: Stripe.Refund;
    try {
      refund = await this.stripeClient.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount !== undefined && { amount }),
      });
    } catch (error) {
      handleStripeError(error);
    }
    Logger.info('[REFUND] Created refund', { paymentIntentId, amount });
    return refund;
  }
}
