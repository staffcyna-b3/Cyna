import { NextFunction, Request, Response } from 'express';
import { IPaymentIntentService } from '../interfaces/IPaymentIntentService';
import { IStripeSubscriptionService } from '../interfaces/IStripeSubscriptionService';
import { SubscriptionItem } from '../interfaces/SubscriptionItem.interface';

export class PaymentController {
  constructor(
    private readonly paymentIntentService: IPaymentIntentService,
    private readonly subscriptionService: IStripeSubscriptionService
  ) {}

  async createIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, currency, description } = req.body as {
        amount: number;
        currency: string;
        description?: string;
      };

      const payload = await this.paymentIntentService.createPaymentIntent(
        amount,
        currency,
        req.user!.userId,
        description,
        req.user!.email
      );

      return res.status(201).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { subscriptionItems, oneTimeAmountCents, oneTimeDescription } = req.body as {
        subscriptionItems: SubscriptionItem[];
        oneTimeAmountCents?: number;
        oneTimeDescription?: string;
      };

      const payload = await this.subscriptionService.createSubscription(
        subscriptionItems,
        oneTimeAmountCents ?? 0,
        oneTimeDescription,
        req.user!.userId,
        req.user!.email
      );

      return res.status(201).json(payload);
    } catch (error) {
      return next(error);
    }
  }

  async getIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PAYMENT_INTENT_ID',
          message: 'Identifiant payment intent invalide',
        });
      }

      const payload = await this.paymentIntentService.retrievePaymentIntent(id, req.user!.userId);
      return res.status(200).json(payload);
    } catch (error) {
      return next(error);
    }
  }
}
