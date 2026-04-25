import { Request, Response } from 'express';
import { SubscriptionLifecycleService } from '../services/subscriptionLifecycleService';

export class SubscriptionLifecycleController {
  constructor(private readonly service: SubscriptionLifecycleService) {}

  async getByCustomerId(req: Request, res: Response): Promise<void> {
    const { stripeCustomerId } = req.params;
    if (!stripeCustomerId) {
      res.status(400).json({ success: false, error: 'MISSING_CUSTOMER_ID' });
      return;
    }
    const subscriptions = await this.service.getByCustomerId(stripeCustomerId);
    res.status(200).json({ success: true, data: subscriptions });
  }

  async cancelAtPeriodEnd(req: Request, res: Response): Promise<void> {
    const { stripeSubscriptionId } = req.params;
    const subscription = await this.service.cancelAtPeriodEnd(stripeSubscriptionId);
    res.status(200).json({ success: true, data: subscription });
  }

  async cancelNow(req: Request, res: Response): Promise<void> {
    const { stripeSubscriptionId } = req.params;
    const subscription = await this.service.cancelNow(stripeSubscriptionId);
    res.status(200).json({ success: true, data: subscription });
  }

  async createRefund(req: Request, res: Response): Promise<void> {
    const { paymentIntentId, amount } = req.body as { paymentIntentId: string; amount?: number };

    if (!paymentIntentId) {
      res.status(400).json({ success: false, error: 'MISSING_PAYMENT_INTENT_ID' });
      return;
    }
    if (amount !== undefined && amount <= 0) {
      res.status(400).json({ success: false, error: 'INVALID_AMOUNT' });
      return;
    }

    const refund = await this.service.createRefund(paymentIntentId, amount);
    res.status(201).json({ success: true, data: refund });
  }
}
