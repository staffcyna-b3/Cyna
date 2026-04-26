import { Request, Response } from 'express';
import { SubscriptionLifecycleService } from '../services/subscriptionLifecycleService';

export class SubscriptionLifecycleController {
  constructor(private readonly service: SubscriptionLifecycleService) {}

  async getByCustomerId(req: Request, res: Response): Promise<void> {
    const stripeCustomerId = req.params.stripeCustomerId as string;
    if (!stripeCustomerId) {
      res.status(400).json({ success: false, error: 'MISSING_CUSTOMER_ID' });
      return;
    }
    const subscriptions = await this.service.getByCustomerId(stripeCustomerId);
    res.status(200).json({ success: true, data: subscriptions });
  }

  async cancelAtPeriodEnd(req: Request, res: Response): Promise<void> {
    const stripeSubscriptionId = req.params.stripeSubscriptionId as string;
    const subscription = await this.service.cancelAtPeriodEnd(stripeSubscriptionId);
    res.status(200).json({ success: true, data: subscription });
  }

  async cancelNow(req: Request, res: Response): Promise<void> {
    const stripeSubscriptionId = req.params.stripeSubscriptionId as string;
    const subscription = await this.service.cancelNow(stripeSubscriptionId);
    res.status(200).json({ success: true, data: subscription });
  }

  async listRefunds(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const refunds = await this.service.listRefunds(limit);
    res.status(200).json({ success: true, data: refunds });
  }

  async createRefund(req: Request, res: Response): Promise<void> {
    const { paymentIntentId, subscriptionId, amount } = req.body as {
      paymentIntentId?: string;
      subscriptionId?: string;
      amount?: number;
    };

    if (!paymentIntentId && !subscriptionId) {
      res.status(400).json({ success: false, error: 'MISSING_PAYMENT_INTENT_OR_SUBSCRIPTION_ID' });
      return;
    }
    if (amount !== undefined && amount <= 0) {
      res.status(400).json({ success: false, error: 'INVALID_AMOUNT' });
      return;
    }

    let resolvedPaymentIntentId = paymentIntentId;
    if (!resolvedPaymentIntentId && subscriptionId) {
      const found = await this.service.resolvePaymentIntentForSubscription(subscriptionId);
      if (!found) {
        res.status(422).json({ success: false, error: 'NO_PAYMENT_INTENT_FOR_SUBSCRIPTION' });
        return;
      }
      resolvedPaymentIntentId = found;
    }

    const refund = await this.service.createRefund(resolvedPaymentIntentId!, amount);
    res.status(201).json({ success: true, data: refund });
  }
}
